
  
      // Your Client ID can be retrieved from your project in the Google
      // Developer Console, https://console.developers.google.com
      var CLIENT_ID = '344192115536-ht99ab51jn4rcbnduqmcccg0c5i9ckd5.apps.googleusercontent.com';



      var SCOPES = ['https://mail.google.com/'];

      var messages = [];
      var nodes = [];

      /*function Node() {
        this.convo = 0;
        this.subject = 0;
        this.message = 0;
        this.sender = 0;
        this.connections = [];
      }*/

      //var messages = [];

//generate UUIDs
	function generateUUID(){
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	}	


      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadGmailApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Gmail API client library. List labels once client library
       * is loaded.
       */
      function loadGmailApi() {
        gapi.client.load('gmail', 'v1', listLabels);
      }

      /**
       * Print all Labels in the authorized user's inbox. If no labels
       * are found an appropriate message is printed.
       */

      function listLabels() { 
        var request = gapi.client.gmail.users.labels.list({
          'userId': 'me'
        });

        request.execute(function(resp) {
          var labels = resp.labels;
          //console.log(resp);
          appendPre('Labels:');
          if (labels && labels.length > 0) {
            for (i = 0; i < labels.length; i++) {
              var label = labels[i];
              appendPre(label.name)
            }
          } else {
            appendPre('No Labels found.');
          }
        });


        listMessages('spox.polyhack@gmail.com',  function callback(result) {
          //console.log(result.length);
          for (var i=0; i<result.length; i++) {
            messages.push(result[i].id);

          }
          //console.log(messages);
          for (var i = 0; i < messages.length; i++) {
            var index = 0;
            getMessage('spox.polyhack@gmail.com', messages[i], function callback(result) {
              var node = new Node();
              if (result.payload.parts[0].body.data === 'undefined') {
                console.log("STOP!");
              }
              if (result.payload.parts[0].body.data != undefined) {
                node.message = result.payload.parts[0].body.data;
                //console.log(node.message);
              }
              //console.log(result);
              var j, k;
              for (j = 0; result.payload.headers[j].name != "From" && result.payload.headers[j].name != undefined; j++);
              //node.sender = result.payload.headers[j].value;
              //console.log(node.sender);
              for (k = 0; result.payload.headers[k].name != "Subject" && result.payload.headers[j].name != undefined; k++);
              //node.subject = result.payload.headers[j].value;
              //console.log(node.subject);


	if (index == 0) root = true;
	else root = false;
              var node = {
		UUID : index,
		root : root,
                sender : result.payload.headers[j].value,
                subject : result.payload.headers[k].value,
                message : result.payload.parts[0].body.data,
		connections: localStorage.getItem("Connect" + index)
              }
              nodes.push(node);
              localStorage.setItem("nodes",JSON.stringify(nodes));
              console.log(nodes);
	      index++;
	      
            });
          }
        });
        console.log(nodes);
/*

         listMessages('spox.polyhack@gmail.com', 'favorite', function callback(result){console.log(result);});
         getMessage('spox.polyhack@gmail.com', '15097a7197fc16af', function callback(result){console.log(result);});
         var email = "From: spox.polyhack@gmail.com" + "\n" +
                     "To: erica.schwartz.4@gmail.com" + "\n" +
                     "Subject: Saying Hello" + "\n" + "So, Hello hi hi 92.";
         sendMessage('spox.polyhack@gmail.com', email, function callback(){
                                                            console.log("done");
                                                            console.log(arguments);
                                                          });

=======
*/

      }
          

      /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */

      function appendPre(message) {
        var pre = document.getElementById('output');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }


      function getMessage(messageId, callback) {
        var request = gapi.client.gmail.users.messages.get({
          'userId': 'spox.polyhack@gmail.com',
          'id': messageId
        });
        request.execute(callback);
      }

      // to get message in base 64: (result)->result->payload->parts[index]->body->data!!!
      // 0 is better

      function listMessages(userId, callback) {
        var getPageOfMessages = function(request, result) {
          request.execute(function(resp) {
            /*var messages = resp.messages;
            console.log(resp);
            appendPre('Messages:');
            if (messages && messages.length > 0) {
              for (i = 0; i < messages.length; i++) {
                var label = messages[i];
                appendPre(messages.name);
              }
            } else {
              appendPre('No Labels found.');
            }*/
            result = result.concat(resp.messages);
            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
              console.log("got here!");
              request = gapi.client.gmail.users.messages.list({
                'userId': userId,
                'pageToken': nextPageToken
              });
              console.log("request.userId");

              getPageOfMessages(request, result);
            } else {
              callback(result);
            }
          });
        };
        var initialRequest = gapi.client.gmail.users.messages.list({
          'userId': userId,
          
        });
        getPageOfMessages(initialRequest, []);
      }

      function getMessage(userId, messageId, callback) {
        var request = gapi.client.gmail.users.messages.get({
          'userId': userId,
          'id': messageId
        });
        request.execute(callback);
      }


      //NODE API
      function Node() {
      }

     

     /**
       * Send Message.
       *
       * @param  {String} userId User's email address. The special value 'me'
       * can be used to indicate the authenticated user.
       * @param  {String} email RFC 5322 formatted String.
       * @param  {Function} callback Function to call when the request is complete.
       */

      /*function sendMessage(userId, email, callback) {
>>>>>>> liveMessages
        console.log(email);
        var base64EncodedEmail = btoa(email);
        console.log(base64EncodedEmail);
        var request = gapi.client.gmail.users.messages.send({
          'userId': userId,
          'message': {
            'raw': base64EncodedEmail
          }
        });
        request.execute(callback);
<<<<<<< HEAD
      }
=======
      }*/



