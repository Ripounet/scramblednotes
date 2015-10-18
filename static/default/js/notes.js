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
		$.post('/note', 
			{
				"ciphertext": ciphertext
			}, 
			function(r) {
				// TODO: save locally BEFORE the request, in case of no internet
				const newNoteId = r.note.ID;
				localStorage["Scramble " + newNoteId] = ciphertext;
				localStorage["Note " + newNoteId] = content;
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
			for(var i = 0; i < words.length; i++) {
				var word = words[i];
				if( x.indexOf(word) === -1)
					return;
			}
			console.log(x);
		});
	}

	// Search string from URL (if any)
	const pos = window.location.href.lastIndexOf('/q/');
	if(pos !== -1){
		const q = window.location.href.substring(pos + 3);
		$("#q").val(q);
	}
});