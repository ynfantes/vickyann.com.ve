
$(document).ready(function() {

	// ==================== LOADER ==================== //
	
     $(window).load(function(){
        $('.doc-loader').fadeOut('slow');
     });


	// ==================== LAYER SLIDER ==================== //
		
    $('#main-slider').layerSlider({
    	responsiveUnder: 1080, 
    	layersContainer: 1080,
    	navPrevNext: true,
    	navButtons: false, 
    	twoWaySlideshow: true, 
    	navStartStop: false, 
    	hoverBottomNav: false, 
    	showCircleTimer: false, 
    	thumbnailNavigation: 'disabled',
		  skinsPath: 'layerslider/skins/'


		}); 
		
	// ==================== UI TO TOP ==================== //		
		
	$().UItoTop({ easingType: 'easeOutQuart' });	
	
	// ==================== TESTMONIALS SLIDER ==================== //

	$("#slider_testimonial").owlCarousel({
			      singleItem:true
			 
	});
	
  
  // ==================== PARTENRS SLIDER ==================== //
	
  $("#slider-partners").owlCarousel({
 
      autoPlay: 3000, //Set AutoPlay to 3 seconds
			pagination: false,
      items : 6
 
  });
  
  // ==================== FAQ ==================== //


  $('#faq .panel-title a').click(function(){
    if($(this).hasClass('collapsed')){
      $(this).find('i').removeClass('fa-plus').addClass('fa-minus');
      $(this).parent().parent().css('border-left','4px solid #1f68c7');
    } else {
      $(this).find('i').removeClass('fa-minus').addClass('fa-plus');
      $(this).parent().parent().css('border-left','none');
    }
  });



});


