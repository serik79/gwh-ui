function reloadPage() {
	const query_for_reload = document.createElement('div');
	// База данных устарела 👴, пожалуста, перезагрузите страницу.
	Object.assign(query_for_reload, {
		className: 'query_for_reload',
		innerHTML: '<h2>The database is out of date 👴 please reload the page.</h2>'
	})
	
	const reload_btn = document.createElement('button');
	Object.assign(reload_btn, {
		type: 'button',
		innerText: 'Reload Page Now',
		onclick: () => document.location.reload()
	})
	
	query_for_reload.append(reload_btn);
	document.body.append(query_for_reload);
}

/*function getFetchResponse(request = {}, contentHandler = () => {throw new Error('"contentHandler" in arguments is empty or not exist!')}) {
	fetch('ajax.php', {
		method: 'POST',
		body: JSON.stringify(request)
	})
		.then((response) => response.json())
		.then((contents) => {
			if ('error' in contents) throw new Error(contents.error);
			if ('success' in contents) console.warn('SUCCESS in fetch response: ', contents.success);
			try {
				contentHandler(contents);
			} catch (err) {
				throw new Error('ERROR in the function "contentHandler": ' + err);
			}
		})
		.catch((err) => {
			
			/!** TODO: display in warnings *!/
			console.error('ERROR in fetch: '+ err.message);
		});
}*/



function getFetchResponse(request = {}, input = '') {
	return fetch(input, {
		method: 'POST',
		body: JSON.stringify(request)
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`Server error: ${response.url} response ${response.status}, "${response.statusText}"`)
			}
		})
		.then((contents) => {
			if ('error' in contents) throw new Error(contents.error);
			if ('success' in contents) console.warn('SUCCESS in fetch response: ', contents.success);
			return contents;
		})
		.catch((err) => {
			/** TODO: display in warnings */
			// console.error('ERROR in fetch: '+ err.message);
			throw new Error('ERROR in fetch: '+ err.message);
		});
}

function setLoader(load = true) {
	if (load) {
		document.body.classList.add('loader', 'disable-hover')
	} else document.body.classList.remove('loader', 'disable-hover')
}

function sortVariants(arr) {
	return arr.sort(function(a, b) {
		let args = [...arguments].map((x) => {
			switch (x) {
				case 'regular': return x = '400';
				case 'italic': return x = '400italic';
			}
			return x;
		});
		return args[0].localeCompare(args[1]);
	})
}

export { reloadPage, getFetchResponse, setLoader, sortVariants };