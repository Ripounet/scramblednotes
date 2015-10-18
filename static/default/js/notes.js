$(function() {

	$('#q').on('keyup change paste',function() {
		// TODO ignore arrow keys events
		const str = $(this).val();
		if( str == '' ){
			window.history.pushState('', '', '/');
		}else{
			window.history.pushState('', '', '/q/' + str);
		}
		search(str);
	});

	$('#read').click(function() {
		const noteId = $('#readId').val();
		$.getJSON(
			'/note',
			{ id: noteId },
			function(response) {
				const scrambleB64 = response.note.Data;
				const scramble = atob(scrambleB64);
				console.log('Note ' + noteId + ' scramble = ' + scramble);
				console.log('Note ' + noteId + ' content = ' + decrypt(scramble) );
			}
		);
	});

	$('#write').click(function() {
		const content = $("#note-content").val();
		const ciphertext = encrypt(content);
		var date = Date.now();
		$.post('/note', 
			{
				"ciphertext": ciphertext
			}, 
			function(r) {
				// TODO: save locally BEFORE the request, in case of no internet
				// TODO consider a conventional hash-id ...?
				const newNoteId = r.note.ID;
				localStorage["Note " + newNoteId] = JSON.stringify({
					"content": content,
					"ciphertext": ciphertext,
					"createDate": date,
					"updateDate": date
				});
				$("#note-content").val("");
			}, 'json');
	});

	$('#sync').click(function() {
		// This fetches updates from server
		$.getJSON(
			'/sync',
			{ clientDataVersion: localStorage["globalDataVersion"] },
			function(response) {
			  if( response.globalDataVersion != localStorage["globalDataVersion"] ){
			  	 localStorage["globalDataVersion"] = response.globalDataVersion;
			  }
			}
		);
	});

	$('#set-private-key').click(function() {
		// Though the website could theorically peek at this value,
		// it must never do so. The key belongs to the user, not to the server.
		localStorage["Private Key"] = $("#private-key").val();
		$("#private-key").val("");
	});

	// dirty means "I have made some local modifications, not pushed to server yet."
	var dirty = false;

	function decrypt(b64cipthertext){
		// TODO a real decryption, with user private key
		return encrypt(b64cipthertext)
	}

	function encrypt(note){
		// TODO a real encryption, with user private key
		// TODO if user private key not set, ask it in a modal dialog

		// This fake encryption is a (symmetrical) XOR
		var str = note;
		var c = '';
		const key = 'K';
		for(i=0; i<str.length; i++) {
			c += String.fromCharCode(str[i].charCodeAt(0).toString(10) ^ key.charCodeAt(0).toString(10));
		}
		return c;
	}

	function search(q){
		console.log("Notes containing " + q + " :");
		var words = q.split(/\s+/);
		$.each(localStorage, function(key, x){
			if(!key.startsWith("Note "))
				return;
			var note = JSON.parse(x);
			if(!note.content)
				return;
			for(var i = 0; i < words.length; i++) {
				var word = words[i];
				if( note.content.indexOf(word) === -1)
					return;
			}
			console.log(note);
		});
	}

	// Search string from URL (if any)
	const pos = window.location.href.lastIndexOf('/q/');
	if(pos !== -1){
		const q = window.location.href.substring(pos + 3);
		$("#q").val(q);
	}
});