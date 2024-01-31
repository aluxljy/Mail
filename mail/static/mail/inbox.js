document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('none', '', '', ''));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipientData, subjectData, bodyData, timestampData) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-view').style.display = 'none';

  recipients = document.querySelector('#compose-recipients');
  subject = document.querySelector('#compose-subject');
  body = document.querySelector('#compose-body');
  
  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';
  
  // Pre-fill the recipient field and email body of the form
  if (recipientData != 'none') {
    recipients.value = recipientData;
    body.value = '"On ' + timestampData + ' ' + recipientData + ' wrote: ' + bodyData + '"';
  }

  // Pre-fill the subject line of the form
  if (subjectData != '') {
    if (subjectData.substring(0, 3) == "RE:") {
      subject.value = subjectData;
    } else {
      subject.value = "RE: ".concat(subjectData);
    }
  }

  document.getElementById('compose-form').addEventListener('submit', function(e) {

    // Prevent default behaviour of the browser from reloading when the form is submitted
    e.preventDefault();

    // Prevent other listeners of the same event from being called
    e.stopImmediatePropagation();

    recipientsValue = recipients.value;
    subjectValue = subject.value;
    bodyValue = body.value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipientsValue, // Pass in values for recipients
        subject: subjectValue, // Pass in values for subject
        body: bodyValue // Pass in values for body
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);

      // Check if the email has been successfully sent
      if (result.message != undefined) {
        alert(JSON.stringify(result.message).replace(/"/g, '')); // Convert message JSON object to string and remove double quotes for alert display
        load_mailbox('sent'); // Once the email has been sent, load the user’s sent mailbox
      } else {
        alert(JSON.stringify(result.error).replace(/"/g, '')); // Convert error JSON object to string and remove double quotes for alert display
      }
    })
    .catch(error => {
      // Print error
      console.log(error);
    });

  });

}

function load_mailbox(mailbox) {
  
  mailboxName = mailbox;

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)  // Pass in the particular mailbox
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // Render each email in its own box
    emails.forEach((email) => {
      const div = document.createElement('div'); // Create a HTML element of div tag
      div.style.border = '1px solid black';
      div.style.padding = '10px 5px';

      // Display the sender, subject and timestamp of the email
      div.innerHTML = `<span class="sender">${email.sender}</span><span>&ensp;</span><span>${email.subject}</span><span class="timestamp">${email.timestamp}</span>`;
      
      // Add an event listener to the element to be able to view the email
      div.addEventListener('click', function() {
        load_email(email.id, mailboxName); // Dislay the email content when the email has been clicked on
        mark_email(email.id); // Mark the email as read when the email has been clicked on
      });
      document.querySelector('#emails-view').append(div); // Append the newly created element to the view

      // Check if the email is unread
      if (email.read == false) {
        div.style.backgroundColor = 'white'; // Appear with a white background
      } else {
        div.style.backgroundColor = 'gray'; // Appear with a gray background
      }
    });
  })
  .catch(error => {
    // Print error
    console.log(error);
  });

}

function load_email(emailId, mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'block';

  const display = document.querySelector('#display-view');

  fetch(`/emails/${emailId}`) // Pass in the particular email ID
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Remove all child nodes from the view
    while (display.hasChildNodes()) {
      display.removeChild(display.firstChild);
    }

    // Create HTML elements of div tag
    const sender = document.createElement('div');
    const recipients = document.createElement('div');
    const subject = document.createElement('div');
    const timestamp = document.createElement('div');
    const body = document.createElement('div');

    // Display the sender, recipients, subject,  timestamp and body of the email
    sender.innerHTML = `<span class="fields">From: </span><span>${email.sender}</span>`;
    recipients.innerHTML = `<span class="fields">To: </span><span>${email.recipients}</span>`;
    subject.innerHTML = `<span class="fields">Subject: </span><span>${email.subject}</span>`;
    timestamp.innerHTML = `<span class="fields">Timestamp: </span><span>${email.timestamp}</span>`;
    body.innerHTML = `<hr><span>${email.body}</span>`;

    // Append the elements to the view
    display.append(sender);
    display.append(recipients);
    display.append(subject);
    display.append(timestamp);
    display.append(body);

    archive = document.createElement('div'); // Create a HTML element of div tag

    if (mailbox == 'inbox') {
      // Display the button 
      archive.innerHTML = `<button class="btn btn-sm btn-outline-primary">Archive</button>`;
      archive.style.display = 'inline';

      // Add an event listener to the element to be able to archive the email
      archive.addEventListener('click', function() {
        fetch(`/emails/${emailId}`, { // Pass in the particular email ID
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        }).then(response => {
          if (response.ok) { // Check if the response was successful
            load_mailbox('inbox');
          }
        })
      });
    } else if (mailbox == 'archive') {
      // Display the button
      archive.innerHTML = `<button class="btn btn-sm btn-outline-primary">Unarchive</button>`;
      archive.style.display = 'inline';

      // Add an event listener to the element to be able to unarchive the email
      archive.addEventListener('click', function() {
        fetch(`/emails/${emailId}`, { // Pass in the particular email ID
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        }).then(response => {
          if (response.ok) { // Check if the response was successful
            load_mailbox('inbox');
          }
        })
      });
    }
    display.insertBefore(archive, display.children[4]); // Insert the element before the fifth child

    reply = document.createElement('div'); // Create a HTML element of div tag

    // Display the button
    reply.innerHTML = `<button class="btn btn-sm btn-outline-primary">Reply</button>`;
    reply.style.display = 'inline';

    // Add an event listener to the element to be able to reply the email
    reply.addEventListener('click', function() {
      compose_email(email.sender, email.subject, email.body, email.timestamp);
    })
    display.insertBefore(reply, display.children[4]); // Insert the element before the fifth child
  })
  .catch(error => {
    // Print error
    console.log(error);
  });

}

function mark_email(emailId) {

  fetch(`/emails/${emailId}`, { // Pass in the particular email ID
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}