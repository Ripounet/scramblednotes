$(function() {

	$('#q').on('keyup',function() {
		const str = $(this).val();
		window.history.pushState('', '', '/' + str);
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

});