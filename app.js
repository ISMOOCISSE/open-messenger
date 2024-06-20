(function (window, $) {
	'use strict';

	const API_ROOT_URL = "http://greenvelvet.alwaysdata.net/kwick/api/";
	const $user = $('#user');
	const $psw = $('#psw');
	const $logout = $('#logout');
	const $submit = $('#submit');
	const $message = $('#message');

	function callKwickAPI(url, cb) {
		var request = $.ajax({
						type: 	'GET',
						dataType: 'jsonp',
						url: 	API_ROOT_URL + url,
		});


		//en cas d'erreur
		request.fail(function(jqXHR, textStatus, errorThrown) {
			cb(textStatus, null);
		});

		//en cas de succès
		request.done(function(data) {
			cb(null, data);
		});
	}

	var app = {

		token: null,
		id: null,
		pseudo: null,

		// Fonction pour l'inscription

		initializeSignUp: function() {
			app.signup();
		},

		signup :function() {
			$('#form').on('submit', app.signupSubmit);
		},

		signupSubmit: function(e) {

			e.preventDefault();
			var valide = true;

			if($user.val() === '' || $psw.val() ===  '') {
				$('#log').empty().append('<p id="cont">Login or Password black</p>');
				valide = false;
			}
			if($psw.val() === $('#psw').val() && valide === true){
				var user = $user.val();
				var psw = $psw.val();

				app.getSignUp(user, psw);

			}
			 
		},

		getSignUp: function(user, psw) {
			callKwickAPI('signup/' + user+ '/'+ psw, function (err, data) {
				if (err)
					return alert(err);

				if (data.result.status == 'failure') {
					$('#log').empty().append('<p id="cont" >this login is not available</p>');
				}else {

					app.setCredentials(data);
					window.location.href="t'chat.html"
				}
			})
		},

		// Fonction pour la connecxion 

		initializeLogin: function() {
			app.login();
		},

		login :function() {
			$('#form').on('submit', app.loginSumit);
		},

		loginSumit: function(e) {

			e.preventDefault();
			var valide = true;

			if($user.val() === '' || $psw.val() ===  '') {
				$('#log').empty().append('<p id="cont">Login or Password black</p>');
				valide = false;
			}
			if(valide === true) {

				var user = $user.val();
				var psw = $psw.val();

				app.getLogin(user, psw);
			}
		},

		getLogin: function(user, psw) {
			callKwickAPI('login/' + user+ '/'+ psw, function (err, data) {
				if (err)
					return alert(err);

				if (data.result.status == 'failure') {
					$('#log').empty().append('<p id="cont">Wrong Login or Password</p>');
				}else{

					app.setCredentials(data);
					window.location.href="t'chat.html"

				}
			})
		},

		// Fonction pour la deconnecxion

		initializeLogout: function() {
			app.logout();
		},

		logout :function() {

			$logout.on('click', function() {

				app.getLogout(app.token, app.id);
				
			})
		},

		getLogout: function(token, id) {
			callKwickAPI('logout/' + token+ '/'+ id, function (err, data) {
				if (err)
					return alert(err);

				app.removeCredentials();

				window.location.href="login.html"
			})
		},

		// Fonction pour afficher la liste des utilisateur connecter avec compteur

		initalizeChat: function () {

			app.getCredentials();

				if ((app.id === 0 || app.token === 'undefined') || (app.id === null || app.token === null)) {
					window.location.href="login.html"
				}else {
					app.getUserLoged();
					app.getMessage();
					setInterval(function(){
						app.getUserLoged();
						app.getMessage();
					}, 5000);	

					// Afficher le nom de l'utilisateur connecté
					document.getElementById('user-name').innerText = app.pseudo;
				}
		},

		getUserLoged: function() {

			app.token = localStorage.getItem("token");

			callKwickAPI('user/logged/' + app.token, function (err, data) {
				if (err)
					return alert(err);

			app.userLoged(data);

			})
		},

		userLoged: function(data) {
			//$('#user_list').empty();
			$('#user_log').empty();
			var compteur = 0;
			
			for (var i = 0; i < data.result.user.length; i++) {
				compteur = compteur + 1;
				$('#compteur').empty();
				$('#compteur').append('Connected people ('+compteur+')')
				//Si l'utilisateur est Hono, je lui assigne une image propre a lui sinon l'image par default
				if(data.result.user[i] === 'Hono'){
					$('#user_log').append('<li><img src="../page/assets/Open-Messenger-User-Avatar.png" alt="photo batman">' + data.result.user[i] + '</li>');
				}//Aplique une autre image pour l'utilisateur
				else if (data.result.user[i] === app.pseudo){
					$('#user_log').append('<li><img src="../page/assets/Open-Messenger-User-Avatar.png" alt="eyes Hono">' + data.result.user[i] + '</li>');
				}else {
					$('#user_log').append('<li><img src="../page/assets/Open-Messenger-User-Avatar.png" alt="Photo Vide">' + data.result.user[i] + '</li>');
				}
			};
		},

		//Fonction pour afficher le t'chat

		getMessage: function() {

			app.token = localStorage.getItem("token");

			callKwickAPI('/talk/list/' + app.token +'/' + 0, function (err, data) {
				if (err)
					return alert(err);

			app.Message(data);

			})
		},

		Message: function(data) {
			var message = data.result.talk;
			$message.empty();
			for (var j = 0; j < message.length; j++) {
				if (message[j].user_name === app.pseudo){
					$message.append('<p class="pseudo"><span><img src="../page/assets/Open-Messenger-User-Avatar.png">  </span>' + message[j].content + '</p>');
					$message.scrollTop(10*1000000);
				}else {			
					$message.append('<p class="other_user"><img src="../page/assets/Open-Messenger-User-Avatar.png"><span>' + message[j].user_name+ "</span> : " + message[j].content + '</p>');
					$message.scrollTop(10*1000000);
				}
			};
		},
	
		//Fonction pour parler dans le t'chat
		
		initializeTalk: function() {
			app.sayUserButton();
		},

		sayUserButton: function() {
			$('#shoutbox').on('submit', app.sendMessage);
		},

		SendsayUser: function(token, id, mess) {

			app.token = localStorage.getItem("token");
			app.id = localStorage.getItem("id");

			callKwickAPI('say/'+ token + '/' + id + '/' + mess, function (err, data) {
				if (err)
					return alert(err);
			})
		},

		sendMessage: function(e) {
			e.preventDefault();

			var mess = encodeURIComponent($('#send').val());

			$message.append('<p class="pseudo"><span>Moi</span> : ' + mess + '</p>');

			app.SendsayUser(app.token, app.id, mess);

			$('#send').val('');

			app.getMessage();
		},


		//Fonction pour Token et Id (LocalStorage)

		setCredentials: function(data) {
			app.token 		= data.result.token;
			app.id    		= data.result.id;
			app.user_img  	= $user;
			app.pseudo		= $user.val()

			localStorage.setItem("token", data.result.token);
			localStorage.setItem("id", data.result.id);
			localStorage.setItem("pseudo", $user.val());
		},

		getCredentials: function () {
			app.token 		= localStorage.getItem("token");
			app.id    		= localStorage.getItem("id");
			app.pseudo    	= localStorage.getItem("pseudo");
		},

		removeCredentials: function() {
			app.token 			= null;
			app.id    			= null;
			app.pseudo   		= null;

			localStorage.removeItem("token");
			localStorage.removeItem("id");
			localStorage.removeItem("pseudo");
		},

		
	};

	window.app = app;

})(window, jQuery)