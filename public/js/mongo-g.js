$(document).foundation();

$(function () {
	
	/* Toggle visibility of ajax spinner graphic on all AJAX requests */
	$(document).ajaxSend(function () {
		$(".ajax-spinner").show();
	});
	$(document).ajaxStop(function () {
		$(".ajax-spinner").hide();
	});


	/*//////////////////////////////////////////////////////////////////////////////////////////
	// Admin login ///////////////////////////////////////////////////////////////////////////*/
	jQuery("#login-form").validate({
		onclick: false,
		submitHandler: function(form) {
			var formData = jQuery(form).serializeArray();
			jQuery.ajax({
				url: '/login-user',
				dataType: "text",
				data: formData,
				type: "POST",
				timeout: 7000,
				cache: false,
				beforeSend: function( ) {
					$(".login-button").hide();
					
				},
				error: function (jqXHR, textStatus, errorThrown) {
					$(".login-button").show();
					$("#alert-modal-title").html("Error");
					$("#alert-modal-message").html("There was an error making this request. Please try again.");
					$('#alert-modal').foundation('reveal', 'open');
				},
				success: function(data) {
					console.log(data);
					if ($.trim(data) != "success")
					{
						$(".login-button").show();
						$("#alert-modal-title").html("Error");
						$("#alert-modal-message").html("Please check your credentials and make sure MongoDB is running.");
						$('#alert-modal').foundation('reveal', 'open');
						
					}
					else
					{
						$('#alert-modal').foundation('reveal', 'close');
						document.location = "/";
					}
				}
			});	
			/* End jQuery.ajax	 */
		}
		/* End submitHandler */
	});
	/* End jQuery(this).validate() */

	/* Toggle visibility of database list slideout container */
	$("#database-toggle").click(function (e) {
		e.preventDefault();
		if ($(this).hasClass("open"))
		{
			$(this).removeClass("open");
			$('#database-list-container').hide("slide", { direction: "right" }, 200);
		}
		else
		{
			$(this).addClass("open");
			$(".top-bar").removeClass("expanded");
			$('#database-list-container').show("slide", { direction: "right" }, 200);
		}
	});

	$(".toggle-topbar").click(function (e) {

		if ($("#database-toggle").hasClass("open"))
		{
			$("#database-toggle").trigger("click");
		}
	});

	var thisDocumentId;

	/* Open delete document modal and confirm document deletion */
	$(".delete-this-document").click(function (e) {
		e.preventDefault();
		$('#delete-document-modal').foundation('reveal', 'open');
		thisDocumentId = $(this).attr("data-doc-id");
		console.log(thisDocumentId);
	});

	/* Close delete document modal */
	$(".cancel-delete-document").click(function (e) {
		$('#delete-document-modal').foundation('reveal', 'close');
	});

	/* Submit delete document form */
	$(".delete-document").click(function (e) {
		$("#delete_id").val(thisDocumentId);
		$("#delete-document-form").submit();
	});

	$("#open-create-collection").click(function (e) {
		e.preventDefault();
		$('#create-collection-modal').foundation('reveal', 'open');

	});

	$("#capped").change(function (e) {
		if ($(this).val() == "yes")
		{
			$(".capped_fields").show();
		}
		else
		{
			$(".capped_fields").hide();
		}
	});

	/* Create collection form */
	$("#create-collection-form").validate({
		onclick: false,
		submitHandler: function(form) {
			form.submit();
			
		}
		/* End submitHandler */
	});
	

	/* Open drop collection modal */
	$("#open-drop-collection").click(function (e) {
		$('#drop-collection-modal').foundation('reveal', 'open');

		$("#collection_drop").attr("value", $(this).attr("data-collection-name"));
	});

	/* Close drop collection modal */
	$(".cancel-drop-collection").click(function (e) {
		$('#drop-collection-modal').foundation('reveal', 'close');
	});

	/* Close drop collection modal */
	$("#drop-collection").click(function (e) {
		$('#drop-collection-form').submit();
	});

	/* Create collection form */
	$("#create-database-form").validate({
		onclick: false,
		submitHandler: function(form) {
			form.submit();
			
		}
		/* End submitHandler */
	});

	/* Open drop database modal */
	$("#open-drop-database").click(function (e) {
		$('#drop-database-modal').foundation('reveal', 'open');

		$("#drop_database").attr("value", $(this).attr("data-database-name"));
	});

	/* Close drop database modal */
	$(".cancel-drop-database").click(function (e) {
		$('#drop-database-modal').foundation('reveal', 'close');
	});

	/* Close drop collection modal */
	$(".drop-database").click(function (e) {
		$('#drop-database-form').submit();
	});
	
});
