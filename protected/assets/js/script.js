/**
 * OpenEyes
 *
 * (C) Moorfields Eye Hospital NHS Foundation Trust, 2008-2011
 * (C) OpenEyes Foundation, 2011-2013
 * This file is part of OpenEyes.
 * OpenEyes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * OpenEyes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with OpenEyes in a file titled COPYING. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package OpenEyes
 * @link http://www.openeyes.org.uk
 * @author OpenEyes <info@openeyes.org.uk>
 * @copyright Copyright (c) 2008-2011, Moorfields Eye Hospital NHS Foundation Trust
 * @copyright Copyright (c) 2011-2013, OpenEyes Foundation
 * @license http://www.gnu.org/licenses/gpl-3.0.html The GNU General Public License V3.0
 */

$(document).ready(function(){

	$('.js-toggle').on('click', function(e) {

		e.preventDefault();

		var trigger = $(this);
		var container = trigger.closest('.js-toggle-container');

		if (!container.length) {
			throw new Error('Unable to find js-toggle container.')
		}

		var body = container.find('.js-toggle-body');

		if (!body.length) {
			throw new Error('Unable to find js-toggle body.')
		}

		if (trigger.hasClass('toggle-hide')) {
			trigger
			.removeClass('toggle-hide')
			.addClass('toggle-show');
			body.slideUp('fast');
		} else {
			trigger
			.removeClass('toggle-show')
			.addClass('toggle-hide');
			body.slideDown('fast', function() {
				body.css('overflow', 'visible');
			});
		}
	});

	(function sidebarEventsToggle() {

		var triggers = $('.sidebar.episodes-and-events .toggle-trigger');
		triggers.on('click', onTriggerClick);

		function onTriggerClick(e) {

			e.preventDefault();

			var trigger = $(this);
			var episodeContainer = trigger.closest('.episode');
			var input = episodeContainer.find('[name="episode-id"]');
			var episode_id = input.val() || 'legacy';
			var state = trigger.hasClass('toggle-hide') ? 'hide' : 'show';

			changeState(episodeContainer, trigger, episode_id, state);
		}

		function changeState(episodeContainer, trigger, episode_id, state) {

			trigger.toggleClass('toggle-hide toggle-show');

			episodeContainer
			.find('.events-container,.events-overview')
			.slideToggle('fast', function() {
				$(this).css({ overflow: 'visible' });
			});

			updateEpisode(episode_id, state);
		}

		function updateEpisode(episode_id, state) {
			$.ajax({
				'type': 'GET',
				'url': baseUrl+'/patient/' + state + 'episode?episode_id='+episode_id,
			});
		}
	}());

	(function patientWarningTooltip() {

		var warning = $('.panel.patient .warning');
		if (!warning.length) {
			return;
		}
		var messages = warning.find('.messages');
		var box = $('<div class="quicklook warning"></div>');

		box.hide();
		box.html(messages.html());
		box.appendTo('body');

		warning.hover(function() {

			var offsetPos = $(this).offset();
			var top = offsetPos.top + $(this).height() + 6;
			var middle = offsetPos.left + $(this).width()/2;
			var left = middle - box.width()/2 - 8;

			box.css({
				position: 'absolute',
				top: top,
				left: left
			});
			box.fadeIn('fast');
		}, function(e){
			box.hide();
		});
	}());

	(function stickyElements() {

		var options = {
			enableHandler: function(instance) {
				instance.element.width(instance.element.width());
				instance.enable();
			},
			disableHandler: function(instance) {
				instance.element.width('auto');
				instance.disable();
			}
		};

		new OpenEyes.UI.StickyElement('.admin.banner', {
			offset: 30,
			wrapperHeight: function(instance) {
				return instance.element.outerHeight(true);
			}
		});

		var header = new OpenEyes.UI.StickyElement('.header', $.extend({
			offset: 25
		}, options));

		new OpenEyes.UI.StickyElement('.event-header', $.extend({
			offset: function() {
				return header.element.height() * -1;
			},
			wrapperHeight: function(instance) {
				return instance.element.outerHeight(true);
			}
		}, options));
	}());

	/**
	 * Tab hover
	 */
	$('.event_tabs li').hover(
			function() {
				$(this).addClass('hover');
			},
			function() {
				$(this).removeClass('hover');
			}
	);

	/**
	 * Warn on leaving edit mode
	 */
	var formHasChanged = false;
	var submitted = false;

	$("#event-content").on("change", function (e) {
		formHasChanged = true;
	});

	//if the save button is on page
	if($('#et_save').length){
		$(".EyeDrawWidget").on("click", function (e) {
			formHasChanged = true;
		});
	}

	window.onbeforeunload = function (e) {
		if (formHasChanged && !submitted) {
			var message = "You have not saved your changes.", e = e || window.event;
			if (e) {
				e.returnValue = message;
			}
			return message;
		}
	}
	$("form").submit(function() {
		submitted = true;
	});

	/**
	 * Site / firm switcher
	 */
	(function firmSwitcher() {

		// Default dialog options.
		var options = {
			id: 'site-and-firm-dialog',
			title: 'Select a new Site and/or Firm'
		};

		// Show the 'change firm' dialog when clicking on the 'change firm' link.
		$('.change-firm a').click(function(e) {

			e.preventDefault();

			new OpenEyes.UI.Dialog($.extend({}, options, {
				url: baseUrl + '/site/changesiteandfirm',
				data: {
					returnUrl: window.location.href,
					patient_id: window.OE_patient_id || null
				}
			})).open();
		});

		// Show the 'change firm' dialog on page load.
		if ($('#site-and-firm-form').length) {
			new OpenEyes.UI.Dialog($.extend({}, options, {
				content: $('#site-and-firm-form')
			})).open();
		}
	}());

	$('#checkall').click(function() {
		$('input.'+$(this).attr('class')).attr('checked',$(this).is(':checked') ? 'checked' : false);
	});

	$('table.patient-list tr.clickable').click(function(e) {
		e.preventDefault();
		window.location.href = baseUrl+'/patient/view/'+$(this).data('id');
	});

	$('select.linked-fields').change(function() {
		if ($(this).hasClass('MultiSelectList')) {
			var element_name = $(this).parent().prev('input').attr('name').replace(/\[.*$/,'');
		} else {
			var element_name = $(this).attr('name').replace(/\[.*$/,'');
		}

		var fields = $(this).data('linked-fields').split(',');
		var values = $(this).data('linked-values').split(',');

		if (inArray($(this).children('option:selected').text(),values)) {
			var vi = arrayIndex($(this).children('option:selected').text(),values);

			for (var i in fields) {
				if (values.length == 1 || i == vi) {
					show_linked_field(element_name,fields[i],i==0);
				}
			}
		}
	});

	$('input[type="radio"].linked-fields').click(function() {
		var element_name = $(this).attr('name').replace(/\[.*$/,'');

		var fields = $(this).data('linked-fields').split(',');

		if ($(this).parent().text().trim() == $(this).data('linked-value')) {
			for (var i in fields) {
				show_linked_field(element_name,fields[i],i==0);
			}
		} else {
			for (var i in fields) {
				hide_linked_field(element_name,fields[i]);
			}
		}
	});
});

function show_linked_field(element_name,field_name,focus)
{
	$('fieldset#'+element_name+'_'+field_name).show();
	$('#div_'+element_name+'_'+field_name).show();
	if (focus) {
		$('#'+element_name+'_'+field_name).focus();
	}
}

function hide_linked_field(element_name,field_name)
{
	$('fieldset#'+element_name+'_'+field_name).hide();
	$('#div_'+element_name+'_'+field_name).hide();

	$('input[name="'+element_name+'['+field_name+']"][type="radio"]').removeAttr('checked');
	$('input[name="'+element_name+'['+field_name+']"][type="text"]').val('');
	$('select[name="'+element_name+'['+field_name+']"]').val('');

	if ($('#'+field_name).hasClass('MultiSelectList')) {
		$('a.MultiSelectRemove[data-name="'+field_name+'[]"]').map(function() {
			$(this).click();
		});
	}
}

function changeState(wb,sp) {
	if (sp.hasClass('hide')) {
		wb.children('.events').slideUp('fast');
		sp.removeClass('hide');
		sp.addClass('show');
	} else {
		wb.children('.events').slideDown('fast');
		sp.removeClass('show');
		sp.addClass('hide');
	}
}

function ucfirst(str) { str += ''; var f = str.charAt(0).toUpperCase(); return f + str.substr(1); }

function format_date(d) {
	if (window["NHSDateFormat"] !== undefined) {
		var date = window["NHSDateFormat"];
		var m = date.match(/[a-zA-Z]+/g);

		for (var i in m) {
			date = date.replace(m[i],format_date_get_segment(d,m[i]));
		}

		return date;
	}
}

function format_date_get_segment(d,segment) {
	switch (segment) {
		case 'j':
			return d.getDate();
		case 'd':
			return (d.getDate() <10 ? '0' : '') + d.getDate();
		case 'M':
			return getMonthShortName(d.getMonth());
		case 'Y':
			return d.getFullYear();
	}
}

function getMonthShortName(i) {
	var months = {0:'Jan',1:'Feb',2:'Mar',3:'Apr',4:'May',5:'Jun',6:'Jul',7:'Aug',8:'Sep',9:'Oct',10:'Nov',11:'Dec'};
	return months[i];
}

function getMonthNumberByShortName(m) {
	var months = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
	return months[m];
}

/**
 * sort comparison function for html elements based on the inner html content, but will check for the presence of data-order attributes and
 * sort on those if present
 *
 * @param a
 * @param b
 * @return
 */
function selectSort(a, b) {
		if (a.innerHTML == rootItem) {
				return -1;
		}
		else if (b.innerHTML == rootItem) {
				return 1;
		}
		// custom ordering
		if ($(a).data('order')) {
			return ($(a).data('order') > $(b).data('order')) ? 1 : -1;
		}

		return (a.innerHTML > b.innerHTML) ? 1 : -1;
};

var rootItem = null;

function sort_selectbox(element) {
	rootItem = element.children('option:first').text();
	element.append(element.children('option').sort(selectSort));
}

function inArray(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(haystack[i] == needle) return true;
	}
	return false;
}

function arrayIndex(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(haystack[i] == needle) return i;
	}
	return false;
}

function getPatients() {
	window.location.href = '/patient/search?'+$('#patient-filter').serialize();
	return;

	var button = $('#search_button');
	var loadingMessage = $('#patient-search-loading');
	var noResultsMessage = $('#patient-search-no-results');
	var theatreList = $('#patientList');

	if (!button.hasClass('inactive')) {
		disableButtons();

		theatreList.empty();
		loadingMessage.show();
		noResultsMessage.hide();

		searchData = $('#patient-filter').serialize()+"&YII_CSRF_TOKEN="+YII_CSRF_TOKEN;

		$.ajax({
			'url': baseUrl+'/site/search?'+$('#patient-filter').serialize(),
			'type': 'GET',
			'dataType': 'json',
			'success': function(data) {
				if (data['status'] == 'success') {
					$('#patientList').html(data['data']);
				} else {
					$('#patientList').html('<h3>'+data['message']+'</h3>');
				}
			},
		});
	}

	return false;
}
