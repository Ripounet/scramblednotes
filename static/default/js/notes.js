$(function() {

	$('#q').on('keyup',function() {
		const str = $(this).val();
		window.history.pushState('', '', '/q/' + str);
		search(str);
	});

	$('#read').click(function() {
		const scramble = localStorage["scramble123"];
		console.log(scramble);
	});

	$('#write').click(function() {
		const content = $("#note-content").val();
		const ciphertext = encrypt(content);
		$.post('/note', 
			{
				"ciphertext": ciphertext
			}, 
			function(r) {
    			const newNoteId = r.note.ID;
    			localStorage["Scramble " + newNoteId] = ciphertext;
    			localStorage["Note " + newNoteId] = content;
			}, 'json');
	});

	$('#sync').click(function() {
		// This fetches updates from server
		$.getJSON(
			'/sync',
			{ clientDataVersion: globalDataVersion },
			function(r) {
			  const serverDataVersion = r.globalDataVersion;
			  if( serverDataVersion != globalDataVersion ){
			  	 globalDataVersion = serverDataVersion;
			  	 localStorage["globalDataVersion"] = serverDataVersion;
			  }
			}
		);
	});

	var globalDataVersion = localStorage["globalDataVersion"];

	// dirty means "I have made some local modifications, not pushed to server yet."
	var dirty = false;

	function decrypt(b64cipthertext){

	}

	function encrypt(note){
		// TODO
		return "[" + note + "]";
	}

	function search(q){
		console.log("Notes containing " + q + " :");
		$.each(localStorage, function(key, x){
			if(key.startsWith("Note ") && x.contains(q)){
    			console.log(x);
    		}
		});
	}

	// Search string from URL (if any)
	const pos = window.location.href.lastIndexOf('/');
	if(pos !== -1){
		const q = window.location.href.substring(pos + 1);
		$("#q").val(q);
	}
});