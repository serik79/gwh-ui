<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<title>Google Webfonts Helper User Interface ;)</title>
	<link rel="shortcut icon" href="assets/img/favicon.ico" type="image/x-icon">
	<link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
	<h1>Google Webfonts Helper User Interface</h1>
	<form action="ajax.php" id="GWH_init_form" class="gwh-init-form" method="post">
		<fieldset id="GWH_init_fieldset">
			<legend>Init</legend>
			<button id="GWH_open_btn" type="button">INIT GWH</button>
			<button id="GWH_delete_btn" type="button" disabled>DELETE GWH</button>
		</fieldset>
	</form>
	<form action="ajax.php" id="GWH_search_form" class="gwh-search-form" method="post">
		<fieldset id="GWH_search_fieldset" disabled>
			<legend class="sr-only">Search</legend>
			<label for="GWH_search_input">Search by family:</label>
			<input type="search" id="GWH_search_input">
			<label for="GWH_subset_select">Select subset:</label>
			<select id="GWH_subset_select">
				<option value="all" selected>All subsets</option>
			</select>
			<label for="GWH_category_select">Select category:</label>
			<select id="GWH_category_select">
				<option value="all" selected>All categories</option>
			</select>
			<button id="GWH_reset_search_btn" type="reset">Reset</button>
			<strong id="GWH_count_items"></strong>
		</fieldset>
	</form>
	
	<section id="GWH_main_holder" class="gwh-main-holder" hidden>
		<aside id="GWH_aside" class="gwh-aside">
			<h2>Downloaded fonts:</h2>
			<ol id="GWH_downloaded_fonts_list" class="gwh-downloaded-fonts-list"></ol>
			<p>There are none yet ;)</p>
		</aside>
		<main id="GWH_main" class="gwh-main">
			<h2>Available fonts:</h2>
			<ol id="GWH_available_fonts_list" class="gwh-available-fonts-list"></ol>
		</main>
	</section>
	
	<script src="assets/js/polyfills.min.js"></script>
	<script type="module" src="assets/js/main.js"></script>
	<script>
		function readyContent() {
			/*let HHH = */new GWHelper({
				open_btn: '#GWH_open_btn'
			});
			// console.log(HHH);
			
			/**
			 * isSticky
			 * */
			/*const stickyElm = document.querySelector('#GWH_search_form')
			const observer = new IntersectionObserver(
				([e]) => e.target.classList.toggle('isSticky', e.intersectionRatio < 1),
				{threshold: [1]}
			);
			observer.observe(stickyElm);*/
			
			
			/**
			 * pointer-events: none;
			 * https://habr.com/ru/post/204238/
			 * */
			let body = document.body, timer;
			window.addEventListener('scroll', function() {
				clearTimeout(timer);
				if(!body.classList.contains('disable-hover')) {body.classList.add('disable-hover')}
				timer = setTimeout(function(){body.classList.remove('disable-hover')},500);
			}, false);
		}
		document.addEventListener('DOMContentLoaded', readyContent, false);
		window.addEventListener('unhandledrejection', (e) => console.error('ERROR in "unhandledrejection": ', e.target, e.reason));
	</script>
</body>
</html>
