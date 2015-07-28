$(function() {

console.log( $('#q').val() );
console.log( $('#qq').val() );

	$('#q').on('keyup',function() {
		const str = $(this).val();
		// console.log( str );
		window.history.pushState('', '', '/' + str);
	});

});