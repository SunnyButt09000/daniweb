/**
 * Website quote PDFs → your Google Drive, with an email copy, deleted automatically after KEEP_DAYS.
 *
 * The website sends each quote request PDF here. This script saves it in a Drive folder,
 * emails you a copy with the PDF attached, and returns a Drive link that the website puts in
 * the customer's WhatsApp message. The link opens only for you (the file stays private).
 *
 * Setup (DEPLOY.md, step 8):
 *   1. script.google.com → New project → paste this file → Save.
 *   2. Run `setup` once and allow access (creates the folder and the daily clean-up).
 *   3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → Deploy.
 *   4. Copy the Web app URL (ends in /exec) into src/data/site.json → quoteUpload.endpoint.
 */

const FOLDER_NAME = 'Website quote requests';
const KEEP_DAYS = 30;        // PDFs older than this go to the Drive bin (Google empties the bin after 30 days)
const EMAIL_COPY = true;     // also email each PDF to the account that owns this script
const MAX_MB = 20;           // largest PDF accepted
const MAX_PER_HOUR = 40;     // simple protection against someone flooding the folder

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return reply({ ok: false, error: 'empty' });
    if (!allow()) return reply({ ok: false, error: 'busy' });
    const data = JSON.parse(e.postData.contents);
    const ref = String(data.ref || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 24) || 'quote';
    const bytes = Utilities.base64Decode(String(data.pdf || ''));
    if (!bytes.length || bytes.length > MAX_MB * 1024 * 1024) return reply({ ok: false, error: 'size' });
    if (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== '%PDF') return reply({ ok: false, error: 'type' });

    const stamp = Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd HH.mm');
    const blob = Utilities.newBlob(bytes, 'application/pdf', `Quote ${ref} ${stamp}.pdf`);
    const file = folder().createFile(blob);
    const summary = String(data.summary || '').slice(0, 8000);
    file.setDescription(summary.slice(0, 1500));

    if (EMAIL_COPY) {
      try {
        MailApp.sendEmail({
          to: Session.getEffectiveUser().getEmail(),
          subject: `Quote request ${ref}`,
          body: `${summary}\n\nPDF in Google Drive: ${file.getUrl()}\n(Deleted from Drive automatically after ${KEEP_DAYS} days.)`,
          attachments: [blob],
          name: 'Website quote request',
        });
      } catch (err) {
        console.warn('Email copy failed', err);
      }
    }
    return reply({ ok: true, url: file.getUrl() });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'server' });
  }
}

// Opening the /exec URL in a browser shows this, so you can check the deployment works.
function doGet() {
  return reply({ ok: true, service: 'quote upload', keepDays: KEEP_DAYS });
}

// Run once by hand: creates the folder and a daily clean-up at about 3am.
function setup() {
  folder();
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'cleanup')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('cleanup').timeBased().everyDays(1).atHour(3).create();
  cleanup();
}

// Moves PDFs older than KEEP_DAYS to the bin.
function cleanup() {
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  const files = folder().getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (f.getDateCreated().getTime() < cutoff) f.setTrashed(true);
  }
}

function folder() {
  const found = DriveApp.getFoldersByName(FOLDER_NAME);
  return found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
}

function allow() {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const cache = CacheService.getScriptCache();
    const key = 'n' + Math.floor(Date.now() / 3600000);
    const n = Number(cache.get(key) || 0);
    if (n >= MAX_PER_HOUR) return false;
    cache.put(key, String(n + 1), 3700);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
