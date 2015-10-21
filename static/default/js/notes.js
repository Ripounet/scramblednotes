
var notesIndex = lunr(function () {
	this.field('content')
	this.ref('id')
});

var timeSearchKeyPressed = 0;

$(function() {
	$('#q').on('keyup change paste',function() {
		// TODO ignore arrow keys events
		const str = $(this).val();
		if( str == '' ){
			window.history.pushState('', '', '/');
		}else{
			window.history.pushState('', '', '/q/' + encodeURI(str));
		}
		timeSearchKeyPressed = new Date().getTime();
		setTimeout(search, 600, str, timeSearchKeyPressed);
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
		dirty = true;
		$.post('/note', 
			{
				"ciphertext": ciphertext
			}, 
			function(r) {
				// TODO: save locally BEFORE the request, in case of no internet
				// TODO consider a conventional hash-id ...?
				const newNoteId = r.note.ID;
				var note = {
					"id": newNoteId,
					"content": content,
					"ciphertext": ciphertext,
					"createDate": date,
				};
				localStorage["Note " + newNoteId] = JSON.stringify(note);
				indexNote(note);
				$("#note-content").val("");
				dirty = false;
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
			  	$("#local-freshness").html(response.globalDataVersion);
			  }
			}
		);
	});

	$('#reindex').click(function() {
		console.log("Reindexing");

		$.each(localStorage, function(key, x){
			if(!key.startsWith("Note "))
				return;
			var note = JSON.parse(x);
			if(!note.content)
				return;
			console.log("Indexing note " + note.id + ": " + note.content );
			indexNote(note);
		});
	});

	$('#nuke').click(function() {
		console.log("Nuking local db");

		$.each(localStorage, function(key, x){
			if(!key.startsWith("Note "))
				return;
			localStorage.removeItem(key);
		});

		notesIndex = lunr(function () {
    		this.field('content')
    		this.ref('id')
  		});
	});

	$('#set-private-key').click(function() {
		// Though the website could theorically peek at this value,
		// it must never do so. The key belongs to the user, not to the server.
		localStorage["Private Key"] = $("#private-key").val();
		$("#private-key").val("");
	});

	// dirty means "I have made some local modifications, not pushed to server yet."
	var dirty = false;

	function indexNote(note){
		notesIndex.add({
			id: note.id,
			content: note.content,
		});
	}

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

	function search(q, thisTimeKeyPressed){
		if(thisTimeKeyPressed != timeSearchKeyPressed){
			// Hold because next call will follow
			return;
		}
		console.log("Notes containing " + q + " :");
		var hits = notesIndex.search(q);
		//console.log("hits=" + hits);
		$.each(hits, function(i, hit){
			//console.log("hit=" + hit);
			var id = hit.ref;
			var key = "Note " + id;
			var note = JSON.parse(localStorage[key]);
			if(!note || !note.content){
				console.warn("Problem 1 with " + key + ": " + note);
				return;
			}
			if( note.content.length < 200 )
				console.log(note.content);
			else
				console.log(note.content.substring(0,200));
		});
	}

	// Iterate on all notes to check if matches.
	// Deprecated for perf reasons, of course.
	function naiveSearch(q){
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

	//
	// At startup, load the a notes database from local file... TODO remove this asap
	//
	var loadDbStart = performance.now();
	$.getJSON("/default_XXX_/partial.json", function(db) {
		var loadDbEnd = performance.now();
		var duration = loadDbEnd - loadDbStart;
    	console.log("Loaded " + db.length + " entries in " + duration + "ms.");
    	//db = db.slice(-500);
    	loadDbStart = performance.now();
    	var n = 0;

		$.each(db, function(key, importedNote){
			var id = importedNote.nid;
			if(importedNote.deletion_date)
				return;
			var note = {
				"id": id,
				"content": importedNote.text,
				"createDate": importedNote.creation_date,
			};
			localStorage["Note " + id] = JSON.stringify(note);
			indexNote(note);
			n++;
		});

		loadDbEnd = performance.now();
		duration = loadDbEnd - loadDbStart;
    	console.log("Indexed " + n + " notes in " + duration + "ms.");

    	// Put index in localStorage.
    	// Warning: this is expensive and redundant. But greatly improves
    	// startup time.
    	loadDbStart = performance.now();
    	var notesIndexAsString = JSON.stringify(notesIndex);
    	console.log("Index size: " + notesIndexAsString.length );
    	localStorage["notesIndex"] = notesIndexAsString;
		loadDbEnd = performance.now();
		duration = loadDbEnd - loadDbStart;
    	console.log("Saved index to localStorage in " + duration + "ms.");
	});
});

