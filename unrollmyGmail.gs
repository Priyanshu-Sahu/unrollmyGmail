// =========
// CONFIGURATION & CONSTANTS
// =========

var SHEET_NAME = "Subscriptions";        
var HEADER_LIST = ["Sender Name", "Sender Email", "Frequency", "Status", "Hidden_Action_Link"];
var HIDDEN_LINK_COLUMN = 5;              

var MAX_SEARCH_THREADS = 500;            
var SEARCH_QUERY = 'label:inbox "unsubscribe"'; 

var OPTION_SUBSCRIBED = 'Subscribed';
var OPTION_UNSUBSCRIBE = 'Unsubscribe';

// Colors
var COLOR_GREEN_BG = "#d9ead3";          
var COLOR_GREEN_TEXT = "#274e13";        
var COLOR_RED_BG = "#f4cccc";            
var COLOR_RED_TEXT = "#cc0000";          
var COLOR_GRAY_BG = "#cccccc";           

// Status Messages
var MSG_DONE_HTTP = "Unsub'd & Moved to Spam (Link)";
var MSG_DONE_EMAIL = "Unsub'd & Moved to Spam (Email)";
var MSG_MANUAL = "Manual Check Required";

// =========
// END OF CONSTANTS
// =========

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Admin Tools')
    .addItem('1. Update Subscription List', 'extractSubscriptions')
    .addItem('2. Activate Dropdown Actions', 'createInstallableTrigger')
    .addToUi();
}

function extractSubscriptions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clear(); 
  }
  
  ss.toast("Scanning Gmail... this may take a moment.", "System", 5);

  sheet.appendRow(HEADER_LIST);
  sheet.getRange(1, 1, 1, HEADER_LIST.length).setFontWeight("bold");
  sheet.hideColumns(HIDDEN_LINK_COLUMN);
  
  var threads = GmailApp.search(SEARCH_QUERY, 0, MAX_SEARCH_THREADS);
  var subscriptions = {};

  threads.forEach(function(thread) {
    var message = thread.getMessages()[0];
    var from = message.getFrom();
    var rawContent = message.getRawContent();
    
    var senderName = from;
    var senderEmail = "";
    var emailMatch = from.match(/<([^>]+)>/);
    if (emailMatch) {
      senderEmail = emailMatch[1];
      senderName = from.replace(emailMatch[0], "").trim().replace(/^"|"$/g, '');
    } else {
      senderEmail = from;
    }

    var actionLink = MSG_MANUAL;
    var headerMatch = rawContent.match(/^List-Unsubscribe: (.+)$/m);
    
    if (headerMatch) {
      var links = headerMatch[1];
      var httpMatch = links.match(/<(https?:\/\/[^>]+)>/);
      var mailtoMatch = links.match(/<(mailto:[^>]+)>/);
      if (httpMatch) actionLink = httpMatch[1];
      else if (mailtoMatch) actionLink = mailtoMatch[1];
    } else {
      var body = message.getBody();
      var bodyLink = body.match(/href="(https?:\/\/[^"]*unsubscribe[^"]*)"/i);
      if (bodyLink) actionLink = bodyLink[1];
    }

    if (subscriptions[senderEmail]) {
      subscriptions[senderEmail].count++;
    } else {
      subscriptions[senderEmail] = { name: senderName, email: senderEmail, count: 1, link: actionLink };
    }
  });

  var output = [];
  for (var key in subscriptions) {
    output.push([
      subscriptions[key].name, 
      subscriptions[key].email, 
      subscriptions[key].count, 
      OPTION_SUBSCRIBED, 
      subscriptions[key].link
    ]);
  }
  
  output.sort(function(a, b) { return b[2] - a[2]; });
  
  if (output.length > 0) {
    sheet.getRange(2, 1, output.length, HEADER_LIST.length).setValues(output);
    
    var lastRow = sheet.getLastRow();
    var statusRange = sheet.getRange(2, 4, lastRow - 1, 1);
    var rule = SpreadsheetApp.newDataValidation().requireValueInList([OPTION_SUBSCRIBED, OPTION_UNSUBSCRIBE], true).build();
    statusRange.setDataValidation(rule);
    
    var rules = [];
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(OPTION_SUBSCRIBED).setBackground(COLOR_GREEN_BG).setFontColor(COLOR_GREEN_TEXT).setRanges([statusRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(OPTION_UNSUBSCRIBE).setBackground(COLOR_RED_BG).setFontColor(COLOR_RED_TEXT).setRanges([statusRange]).build());
    sheet.setConditionalFormatRules(rules);
    
    ss.toast("Success! Found " + output.length + " subscriptions.", "Complete", -1);
  } else {
    ss.toast("No subscriptions found.", "Info", 5);
  }
}

function createInstallableTrigger() {
  var ss = SpreadsheetApp.getActive();
  
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  ScriptApp.newTrigger('processUnsubscribeChange')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
    
  SpreadsheetApp.getUi().alert("✅ System Updated! Unsubscribing will now also move emails to SPAM.");
}

function processUnsubscribeChange(e) {
  var range = e.range;
  var sheet = range.getSheet();
  
  if (sheet.getName() !== SHEET_NAME) return;
  if (range.getColumn() !== 4 || e.value !== OPTION_UNSUBSCRIBE) return;

  var row = range.getRow();
  var link = sheet.getRange(row, HIDDEN_LINK_COLUMN).getValue(); 
  var senderEmail = sheet.getRange(row, 2).getValue(); // Get Sender Email from Column B
  
  // POP-UP NOTIFICATION START
  SpreadsheetApp.getActiveSpreadsheet().toast("Unsubscribing & Moving to Spam...", "Processing", 3);

  // Helper Function to Move to Spam
  var moveToSpam = function(email) {
    try {
      var threads = GmailApp.search('from:' + email);
      if (threads.length > 0) {
        GmailApp.moveThreadsToSpam(threads);
        return true;
      }
      return false; // No threads found to move
    } catch (e) {
      console.log("Spam move error: " + e.message);
      return false;
    }
  };

  if (link === MSG_MANUAL || link === "") {
    // Even if we can't unsub, we CAN still move to spam
    moveToSpam(senderEmail);
    range.setNote("Manual Unsub Check Required. \nBut emails were moved to Spam.");
    range.setValue("Moved to Spam Only");
    range.setBackground(COLOR_GRAY_BG);
    SpreadsheetApp.getActiveSpreadsheet().toast("⚠️ No Unsub link, but moved to Spam.", "Partial Success", 5);
    return;
  }
  
  try {
    if (link.indexOf("http") === 0) {
      var response = UrlFetchApp.fetch(link, {muteHttpExceptions: true});
      if (response.getResponseCode() === 200) {
         moveToSpam(senderEmail); // EXECUTE SPAM MOVE
         range.setValue(MSG_DONE_HTTP);
         range.setBackground(COLOR_GRAY_BG);
         SpreadsheetApp.getActiveSpreadsheet().toast("✅ Unsubscribed & Spammed!", "Success", 5);
      } else {
         range.setNote("Error: Server returned " + response.getResponseCode());
         SpreadsheetApp.getActiveSpreadsheet().toast("❌ Server Error. Check Note.", "Error", 5);
      }
    } else if (link.indexOf("mailto:") === 0) {
      var parts = link.replace("mailto:", "").split("?");
      var toAddress = parts[0];
      var subject = "Unsubscribe";
      if (parts.length > 1) {
         var params = parts[1].split("&");
         params.forEach(function(p) { if (p.indexOf("subject=") === 0) subject = decodeURIComponent(p.replace("subject=", "")); });
      }
      GmailApp.sendEmail(toAddress, subject, "Please unsubscribe me.");
      moveToSpam(senderEmail); // EXECUTE SPAM MOVE
      range.setValue(MSG_DONE_EMAIL);
      range.setBackground(COLOR_GRAY_BG);
      SpreadsheetApp.getActiveSpreadsheet().toast("✅ Email Sent & Spammed!", "Success", 5);
    }
  } catch (err) {
    range.setNote("Error: " + err.message);
    SpreadsheetApp.getActiveSpreadsheet().toast("❌ Error: " + err.message, "Error", 5);
  }
}
