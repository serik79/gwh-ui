'use strict';

import {SUBSETS_PANGRAMS, RTL_SUBSETS, WEIGHT_NAME, VARIANTS_EXPLICATION} from './modules/constants.min.js';
import {reloadPage, getFetchResponse, setLoader, sortVariants} from './modules/helpers.min.js';
import {IndDB} from './modules/indexeddb.min.js';


class GWHelper {
	
	/** private const */
	open_db_options = {
		upgrade: (e, obj) => {
			let db = e.target.result;
			db.onerror = (err) => console.error('ERROR IN "REQUEST_DB.onupgradeneeded": ', err.target.error || err);
			if (e.oldVersion < 1) {
				let store = db.createObjectStore(this.options.available_fonts_store_name, {keyPath: 'id'});
				store.createIndex("family", "family", {unique: true});
				// store.createIndex("variants", "variants", {unique: false});
				store.createIndex("subsets", "subsets", {unique: false, multiEntry: true});
				store.createIndex("category", "category", {unique: false});
				// store.createIndex("defSubset", "defSubset", {unique: false});
				// store.createIndex("defVariant", "defVariant", {unique: false});
				
				store = db.createObjectStore(this.options.downloaded_fonts_store_name, {keyPath: 'id'});
				store.createIndex("variants", "variants", {unique: false, multiEntry: true});
			}
		},
		success: (e) => {
			let db = e.target.result;
			/** TODO: display in warnings */
			db.onerror = (err) => console.error('ERROR IN "REQUEST_DB.onsuccess": ', err.target.error || err);
			db.onversionchange = () => {
				db.close();
				console.warn('%cThe database is out of date 👴 please reload the page.', 'color:red;font-size:30px');
				reloadPage();
			}
			return db;
		}
	}
	
	constructor(options) {
		this.options = {
			available_fonts_store_name: 'available_fonts',
			downloaded_fonts_store_name: 'downloaded_fonts',
			db_name: 'fontsDB',
			db_version: 1,
		}
		Object.assign(this.options, options);
		this.init();
	}

	init() {
		/**
		 * Using Object Destructuring and Property Shorthand 👏👏👏
		 * https://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties
		 * ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
		 * */
		this.indDB = new IndDB((({db_name, db_version}) => ({db_name, db_version}))(this.options));
		this.open_btn = document.querySelector(this.options.open_btn || '#GWH_open_btn');
		this.delete_btn = document.querySelector(this.options.delete_btn || '#GWH_delete_btn');
		
		let togglePlugin = (disable, enable) => {
			setLoader();
			this[disable +'_btn'].setAttribute('disabled', 'disabled');
			this[enable +'_btn'].addEventListener('click', () => {
				this.indDB[enable](this.open_db_options)
					.then(response => {
						togglePlugin(enable, disable);
						console.info(response)
					})
					.catch(err => {
						console.error(err.message)
					});
			}, {once: true});
			this[enable +'_btn'].removeAttribute('disabled');
			this._initAction(disable);
		}
		
		/**
		 * Проверка на существование базы данных и если нет, вывод кнопки с запуском плагина
		 * по событию click с дальнейшим отключением кнопки
		 * TODO: возможно поменять способ инит при загрузке с существующей базой
		 * */
		indexedDB.databases()
			.then(response => {
				togglePlugin('delete', 'open');
				if (!!(response.filter(db => db.name === this.options.db_name && db.version === this.options.db_version)).length) {
					this.open_btn.dispatchEvent(new Event('click'));
				}
			});
	}
	
	_initAction(action) {
		/** -------------------------- COMMON ----------------------------- */
		this._findVariables();
		this._findElements();
		/** -------------------------- END COMMON ----------------------------- */
		if (action === 'open') {
			/** -------------------------- OPEN ----------------------------- */
			const mainHandler = (arg) => {
				this._createAvailableFontsList()
					.then((response) => {
						this._attachEvents(response);
						
						this._createDownloadedFontsList(response)
							.then(list => {
								console.log(list);
							});
					})
					.finally(setLoader(false));
			};
			
			const transaction = this.indDB._transaction([this.options.available_fonts_store_name, this.options.downloaded_fonts_store_name]);
			
			/**
			 * Проверить, содержит ли таблица available_fonts записи и если нет, сделать
			 * запрос на сервер
			 * */
			transaction.objectStore(this.options.available_fonts_store_name)
				.count().onsuccess = (e) => {
					if (!e.target.result) {
						let request = {
							action: 'get_font'
						}
						let contentHandler = (data) => {
							this.indDB.setStoreData([this.options.available_fonts_store_name], [data])
								.then(resolve => {
									// console.log(resolve);
									mainHandler();
								})
								.catch(err => console.error(err));
						};
						
						getFetchResponse(request)
							.then(data => contentHandler(data))
							.catch(err => {
								console.error(err);
								setLoader(false);
							});
					} else {
						mainHandler();
					}
			}
			
			/**
			 * Проверить, содержит ли таблица downloaded_fonts записи и если нет, сделать
			 * запрос на сервер
			 * */
			transaction.objectStore(this.options.downloaded_fonts_store_name)
				.count().onsuccess = (e) => {
					if (e.target.result) {
						/* TODO: НА этом месте функция вывода уже выбранных и загруженных шрифтов */
					}
			}
			/** -------------------------- END OPEN ----------------------------- */
		} else if (action === 'delete') {
			/** -------------------------- DELETE ----------------------------- */
			this.search_fieldset.setAttribute('disabled', 'disabled');
			this.available_fonts_list_items = this.search_input.value = null;
			this.available_fonts_list.innerHTML = this.count_items.innerHTML = '';
			this.main_holder.setAttribute('hidden', '');
			setLoader(false);
			/** -------------------------- END DELETE ----------------------------- */
		}
	}
	
	_findVariables() {
		this.GWH_url = 'https://google-webfonts-helper.herokuapp.com/api/fonts';
		this.font_detalis_id_prefix = this.options.font_detalis_id_prefix || 'GWH_font_details_';
		this.fonts_path = this.options.fonts_path || '/assets/fonts/';
	}
	
	_findElements() {
		this.search_form = document.querySelector(this.options.search_form || '#GWH_search_form');
		this.search_fieldset = document.querySelector(this.options.search_fieldset || '#GWH_search_fieldset');
		this.search_input = document.querySelector(this.options.search_input || '#GWH_search_input');
		this.subset_select = document.querySelector(this.options.subset_select || '#GWH_subset_select');
		this.category_select = document.querySelector(this.options.category_select || '#GWH_category_select');
		this.count_items = document.querySelector(this.options.count_items || '#GWH_count_items');
		this.main_holder = document.querySelector(this.options.main_holder || '#GWH_main_holder');
		this.available_fonts_list = document.querySelector(this.options.available_fonts_list || '#GWH_available_fonts_list');
		this.downloaded_fonts_list = document.querySelector(this.options.downloaded_fonts_list || '#GWH_downloaded_fonts_list');
	}
	
	_createAvailableFontsList() {
		const callback_observer = (entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					document.head.insertAdjacentHTML('beforeend',
						`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${entry.target.dataset.query}">`);
					
					observer.unobserve(entry.target);
				}
			});
		};
		
		const observer = new IntersectionObserver(callback_observer, {rootMargin: '100% 0px 100% 0px'});
		const categories = new Set();
		const subsets = new Set();
		
		const getSubsetsText = (value) => {
			let subsets_text = '';
			value.subsets.forEach((s) => {
				subsets.add(s);
				let subset_class = 'alert-text';
				if (SUBSETS_PANGRAMS[s]) {
					subset_class = s;
					if (RTL_SUBSETS.includes(s)) subset_class += ' rtl';
				}
				subsets_text += `<p class="${subset_class}">${SUBSETS_PANGRAMS[s] || 'no pangram for this language'}</p>`;
			});
			return subsets_text;
		}
		
		const getVariants = (value) => {
			let variants = '';
			if (value.variants.length === 1 && value.defVariant !== 'regular') {
				if (value.defVariant === 'italic') {
					variants = ':ital,wght@1,400';
				} else variants = ':wght@' + value.defVariant;
			} else if (!value.variants.includes('regular')) {
				variants = ':wght@' + value.defVariant;
			}
			return variants;
		}
		
		const createItem = (value) => {
			let variants = getVariants(value);
			let subsets_text = getSubsetsText(value);
			
			let link = document.createElement('a');
			link.className = 'font-summary';
			link.href = '#' + this.font_detalis_id_prefix + value.id;
			link.innerHTML = `<h3 class="title">"${value.family}"</h3>${subsets_text}`;
			
			let details = document.createElement('div');
			details.className = 'font-details';
			details.id = this.font_detalis_id_prefix + value.id;
			details.setAttribute('hidden', '');
			
			let item = document.createElement('li');
			item.style.fontFamily = `'${value.family}'`;
			item.dataset.query = value.family.split(' ').join('+') + variants + '&display=swap';
			item.dataset.id = value.id;
			item.append(...[link, details])
			
			observer.observe(item);
			return item;
		}
		
		document.head.insertAdjacentHTML('beforeend',
			'<link rel="preconnect" href="https://fonts.gstatic.com">');
		
		return new Promise((resolve) => {
			const available_fonts_list_items = {};
			const store_name = this.options.available_fonts_store_name;
			const request = this.indDB._transaction(store_name).objectStore(store_name).openCursor();
			
			request.onsuccess = (e) => {
				let cursor = e.target.result;
				if (cursor) {
					let value = cursor.value;
					
					categories.add(value.category);
					
					available_fonts_list_items[value.id] = createItem(value);
					cursor.continue();
				} else {
					resolve([available_fonts_list_items, subsets, categories]);
				}
			}
		});
	}
	
	_attachEvents(response) {
		let [available_fonts_list_items, subsets, categories] = response;
		let prefix = 'subset-';
		
		this.available_fonts_list_items = available_fonts_list_items;
		
		this.search_fieldset.removeAttribute('disabled');
		this.main_holder.removeAttribute('hidden');
		
		let categories_options = [...categories]
			.sort((a, b) => a.localeCompare(b))
			.map(c => new Option(c, c))
			.reverse();
		this.category_select.append(...categories_options);
		
		let subsets_options = [...subsets]
			.sort((a, b) => a.localeCompare(b))
			.map(s => new Option(s, s));
		this.subset_select.append(...subsets_options);
		
		const searchFonts = (list) => {
			const searchInKeys = (value, list) => {
				if (!value && this.search_input.value) value = this.search_input.value;
				this.available_fonts_list.innerHTML = this.count_items.innerHTML = '';
				
				const fragment = document.createDocumentFragment();
				
				let matches = list.filter(s => (s.family.toLowerCase()).includes(value.toLowerCase()));
				this.count_items.append(matches.length);
				
				matches.forEach((item) => {
					fragment.appendChild(this.available_fonts_list_items[item.id]);
				});
				
				this.available_fonts_list.append(fragment);
				setLoader(false);
			}
			
			searchInKeys('', list);
			['focus', 'input'].forEach(evt =>
				this.search_input.addEventListener(evt, (e) => {
					searchInKeys(e.target.value, list);
				}, false)
			);
		}
		
		this.indDB.getAllData({store: this.options.available_fonts_store_name})
			.then(result => searchFonts(result));
		
		this.subset_select.onchange = (e) => {
			this.indDB.getAllData({
				store: this.options.available_fonts_store_name,
				condition: !!e.target.selectedIndex,
				index: 'subsets',
				value: !!e.target.selectedIndex ? e.target.value : null
			}).then(result => {
				[...this.available_fonts_list.classList].forEach(className => {
					if (className.startsWith(prefix)) this.available_fonts_list.classList.remove(className);
				});
				
				if (e.target.selectedIndex) {
					this.available_fonts_list.classList.add(prefix + e.target.value);
				}
				
				if (this.category_select.selectedIndex) {
					result = result.filter(elem => elem['category'] === this.category_select.value);
				}
				
				searchFonts(result);
				
				Object.values(this.available_fonts_list_items).forEach((item) => {
					if (item.classList.contains('has-details')) {
						item.classList.remove('has-details', 'active');
						item.querySelector('.font-details').innerHTML = '';
					}
				});
			});
		}
		
		this.category_select.onchange = (e) => {
			this.indDB.getAllData({
				store: this.options.available_fonts_store_name,
				condition: !!e.target.selectedIndex,
				index: 'category',
				value: !!e.target.selectedIndex ? e.target.value : null
			}).then(result => {
				if (this.subset_select.selectedIndex) {
					result = result.filter(elem => elem.subsets.includes(this.subset_select.value));
				}
				searchFonts(result);
			});
		}
		
		this.search_form.onreset = () => {
			setLoader();
			[...this.available_fonts_list.classList].forEach(className => {
				if (className.startsWith(prefix)) this.available_fonts_list.classList.remove(className);
			});
			this.indDB.getAllData({store: this.options.available_fonts_store_name})
				.then(result => searchFonts(result));
		}
		
		this.available_fonts_list.onclick = (e) => {
			let link = e.target.closest('a');
			if (!link) return;
			e.preventDefault();
			
			this._createFontFamily(link);
		}
	}
	
	_createFontFamily(link) {
		const item = link.parentElement;
		const font_id = item.dataset.id;
		const font_details = item.querySelector(link.getAttribute('href'));
		
		const subsetsCheckboxes = (result) => {
			return result.subsets.map((s) => {
				let checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.value = s;
				if (s === result.defSubset || s === this.subset_select.value) {
					checkbox.setAttribute('checked', '');
				}
				
				let label = document.createElement('label');
				label.innerText = s;
				label.prepend(checkbox);
				
				return label;
			});
		}
		
		const subsetsFieldset = (checkboxes) => {
			const fieldset = document.createElement('div');
			fieldset.className = 'subsets-holder';
			fieldset.innerHTML = `<h4 class="subsets-title">Subsets</h4>`;
			fieldset.append(...checkboxes);
			/*checkboxes.forEach((c, i, arr) => {
				fieldset.append(c);
				if (++i !== arr.length) fieldset.append(', ');
			});*/
			return fieldset;
		}
		
		const variantItem = (result, v, subsets) => {
			const fieldset = document.createElement('li');
			fieldset.className = 'variation-holder';
			Object.assign(fieldset.style, {...VARIANTS_EXPLICATION[v]});
			
			const link = document.createElement('a');
			link.style.color = 'green';
			link.href = `${this.GWH_url + '/' + result.id}?download=zip&variants=${v}&formats=woff2`;
			link.innerText = 'download';
			link.className = 'variation-download-link';
			link.setAttribute('download', '');
			link.onclick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				
				setLoader();
				this._downloadFont(result, v, subsets, e)
					.then(response => {
						// console.log(response);
						this._createDownloadedFontsList(response)
							.then(list => {
								console.log(list);
							});
					})
					.catch(e => console.error(e))
					.finally(() => {setLoader(false)});
			}
			
			const variation_title = document.createElement('h4');
			variation_title.className = 'variation-title';
			variation_title.innerText = WEIGHT_NAME[VARIANTS_EXPLICATION[v].fontWeight] +
				(VARIANTS_EXPLICATION[v].fontStyle ? ' '+VARIANTS_EXPLICATION[v].fontStyle : '') +
				' . . . . . ';
			
			variation_title.appendChild(link);
			
			let subset = result.defSubset;
			if (this.subset_select.selectedIndex) {
				subset = this.subset_select.value;
			}
			
			const text = document.createElement('p');
			text.innerText = SUBSETS_PANGRAMS[subset];
			text.className = 'variation-subset-text';
			if (RTL_SUBSETS.some((rtl) => rtl === subset)) text.className = 'rtl';
			
			fieldset.append(...[variation_title, text]);
			
			return fieldset;
		}
		
		const familyDOM = (result) => {
			const fragment = document.createDocumentFragment();
			const variantsList = document.createElement('ul');
			const subsets_checkboxes = subsetsCheckboxes(result);
			
			sortVariants(result.variants).forEach((v) => {
				variantsList.appendChild(variantItem(result, v, subsets_checkboxes));
			});
			
			fragment.append(...[subsetsFieldset(subsets_checkboxes), variantsList]);
			return fragment;
		}
		
		const familyCss = (result) => {
			let query = result.family.split(' ').join('+');
			let wghts = [];
			let style = false;
			
			if (result.variants.some((v) => v.endsWith('italic'))) {
				style = true;
				query += ':ital';
			}
			
			result.variants.forEach((i) => {
				if (style) {
					wghts.push((VARIANTS_EXPLICATION[i].fontStyle ? '1' : '0') + ',' + VARIANTS_EXPLICATION[i].fontWeight);
				} else wghts.push(VARIANTS_EXPLICATION[i].fontWeight);
			});
			
			if (wghts.length) {
				query += (style ? ',' : ':') + 'wght@' + wghts.sort((a, b) => a.localeCompare(b)).join(';');
			}
			query += '&display=swap';
			
			return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${query}">`;
		}
		
		Promise.resolve()
			.then(async () => {
				if (!item.classList.contains('has-details')) {
					await this.indDB.getAllData({
						store: this.options.available_fonts_store_name,
						value: font_id
					}).then(r => {
						let [result] = r;
						font_details.innerHTML = '';
						font_details.appendChild(familyDOM(result));
						
						if (!item.classList.contains('foreign-css-downloaded')) {
							document.head.insertAdjacentHTML('beforeend', familyCss(result));
						}
					});
				}
			})
			.then(() => {
				this.available_fonts_list.childNodes.forEach(n => n.classList.remove('active'));
				item.classList.add('active', 'has-details', 'foreign-css-downloaded');
				window.scroll({
					top: window.scrollY + item.getBoundingClientRect().top - (document.getElementById('GWH_search_form').offsetHeight + 10),
					left: 0,
					behavior: 'smooth'});
			});
		
	}
	
	_downloadFont(result, variant, subsets, e) {
		const checked_subsets = [].filter.call(subsets, (c) => c.control.checked).map(c => c.control.value);
		const store_name = this.options.downloaded_fonts_store_name;
		
		if (checked_subsets.length) {
			e.target.href = `${this.GWH_url + '/' + result.id}?download=zip&subsets=${checked_subsets.join(',')}&variants=${variant}&formats=woff2`;
		}
		
		const request = {
			action: 'get_font',
			font: e.target.getAttribute('href').replace(this.GWH_url + '/', ''),
			info: {
				family: result.family
			}
		}
		
		const get_store = (resolve, reject, data) => {
			return this.indDB._transaction(store_name, {
				complete: () => {resolve(data)},
				error: (e) => {reject(e)}
			}, 'readwrite').objectStore(store_name);
		}
		
		return new Promise((resolve, reject) => {
			this.indDB._transaction(store_name)
				.objectStore(store_name)
				.get(result.id)
				.onsuccess = (e) => {
				let result = e.target.result;
				
				if (!checked_subsets.length) {
					reject(`Chose the subset(s), please!`); return;
				}
				if (!result) {
					getFetchResponse(request)
						.then(data => {
							get_store(resolve, reject, data)
								.add(data.font);
						})
						.catch(err => {
							console.error(err);
							setLoader(false);
						});
				} else {
					
					if(!(variant in result.variants)){
						getFetchResponse(request)
							.then(data => {
								let store = get_store(resolve, reject, data);
								Object.assign(result.variants, data.font.variants);
								store.put(result);
							})
							.catch(err => {
								console.error(err);
								setLoader(false);
							});
					} else {
						let result_subsets = result.variants[variant].subsets.split(',');
						
						if (checked_subsets.length !== result_subsets.length ||
							(checked_subsets.filter(s => !result_subsets.includes(s))).length) {
							getFetchResponse({
								action: 'delete_font',
								font: result.variants[variant].files
							})
								.then(() => {
									getFetchResponse(request)
										.then(data => {
											let store = get_store(resolve, reject, data);
											Object.assign(result.variants, data.font.variants);
											store.put(result);
										})
										.catch(err => {
											console.error(err);
											setLoader(false);
										});
								})
								.catch(err => {
									console.error(err);
									setLoader(false);
								});
						} else reject(`The font ${result.family + ' ' + variant} is exists!`);
					}
				}
			}
		});
	}
	
	_createDownloadedFontsList() {
		const fragment = document.createDocumentFragment();
		
		return new Promise((resolve) => {
			const downloaded_font_face = [];
			const downloaded_fonts_list_items = {};
			const store_name = this.options.downloaded_fonts_store_name;
			const request = this.indDB._transaction(store_name).objectStore(store_name).openCursor();
			
			request.onsuccess = (e) => {
				let cursor = e.target.result;
				if (cursor) {
					let value = cursor.value;
					let variants = Object.keys(value.variants);
					let fonts = document.createElement('ul');
					fonts.className = 'font-downloaded-details';
					fonts.id = this.font_detalis_id_prefix + '_downloaded_' + value.id;
					fonts.setAttribute('hidden', '');
					const open_close_link = document.createElement('a');
					
					sortVariants(variants).forEach((v) => {
						const subsets = (value.variants[v].subsets).split(',');
						
						const var_del_link = document.createElement('a');
						var_del_link.className = 'variation-delete-link';
						var_del_link.innerText = 'delete';
						var_del_link.title = 'delete variation';
						var_del_link.href = window.location.origin + this.fonts_path + value.variants[v].files[0];
						var_del_link.onclick = (e) => {
							e.preventDefault();
							e.stopPropagation();
							
							getFetchResponse({
								action: 'delete_font',
								font: value.variants[v].files
							})
								.then((data) => {
									let store = this.indDB._transaction(store_name, {
										complete: () => {
											this._createDownloadedFontsList(data)
												.then(list => {
													console.log(list);
													
													/** TODO: make the open-close link open and scroll back */
													// if (open_close_link) {
													// 	console.log(open_close_link);
													// 	open_close_link.dispatchEvent(new Event('click'));
													// }
													
												});
										}
									}, 'readwrite').objectStore(store_name);
									
									if (variants.length > 1) {
										delete value.variants[v];
										store.put(value);
									} else store.delete(value.id);
								})
								.catch(err => {
									console.error(err);
									setLoader(false);
								});
						}
						
						const var_title = document.createElement('h4');
						var_title.className = 'variation-title';
						var_title.innerHTML = `${
							WEIGHT_NAME[VARIANTS_EXPLICATION[v].fontWeight] +
							(VARIANTS_EXPLICATION[v].fontStyle ? ' ' + VARIANTS_EXPLICATION[v].fontStyle : '')
						} <small>${subsets.join('</small>, <small>')}</small>`;
						var_title.appendChild(var_del_link);
						
						const font = document.createElement('li');
						Object.assign(font.style, VARIANTS_EXPLICATION[v]);
						font.className = 'variation-holder';
						font.dataset.variant = v;
						
						font.appendChild(var_title);
						
						subsets.forEach((s) => {
							let subset_class = RTL_SUBSETS.includes(s) ? s + ' rtl' : s;
							font.insertAdjacentHTML('beforeend',
								`<p class="${subset_class}">${SUBSETS_PANGRAMS[s] || 'no pangram for this language'}</p>`);
						})
						
						fonts.appendChild(font);
						
						let font_face_variant = (
							({fontWeight, fontStyle = 'normal'}) => ({weight: fontWeight, style: fontStyle})
						)(VARIANTS_EXPLICATION[v]);
						
						let font_face = new FontFace(String(value.family).split(' ').join('-') + '-downloaded',
							`url(${this.fonts_path + value.variants[v].files[0]})`,
							Object.assign(font_face_variant, {display: 'swap'})
						);
						
						downloaded_font_face.push(font_face);
					});
					
					let count_variants = variants.length > 1 ? ` <sup>${variants.length}</sup>` : '';
					const fam_del_link = document.createElement('a');
					fam_del_link.className = 'family-delete-link';
					fam_del_link.innerText = '❌' /*'␡'*/;
					fam_del_link.title = 'delete family';
					fam_del_link.href = '#';
					fam_del_link.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						
						getFetchResponse({
							action: 'delete_font',
							font: Object.values(value.variants).map(f => f.files).flat()
						})
							.then(() => {
								this.indDB._transaction(store_name, {
									complete: (data) => {
										this._createDownloadedFontsList(data)
											.then(list => {
												console.log(list);
											});
									}
								}, 'readwrite').objectStore(store_name).delete(value.id);
							})
							.catch(err => {
								console.error(err);
								setLoader(false);
							});
					}
					
					// const open_close_link = document.createElement('a');
					open_close_link.className = 'open-close-link';
					open_close_link.href = '#' + this.font_detalis_id_prefix + '_downloaded_' + value.id;
					open_close_link.innerHTML = `${value.family + count_variants}`;
					open_close_link.onclick = (e) => {
						e.preventDefault();
						e.stopPropagation();
						
						Array.from(this.downloaded_fonts_list.querySelectorAll('.font-downloaded-details'))
							.filter(f => f !== fonts)
							.forEach(f => {f.setAttribute('hidden', '')});
						Array.from(this.downloaded_fonts_list.querySelectorAll('.open-close-link'))
							.filter(l => l !== open_close_link)
							.forEach(l => l.classList.remove('active'));
						
						if (fonts.hasAttribute('hidden')){
							fonts.removeAttribute('hidden');
							open_close_link.classList.add('active');
						} else {
							fonts.setAttribute('hidden', '');
							open_close_link.classList.remove('active');
						}
					};
					
					const title = document.createElement('h3');
					title.className = 'title';
					title.append(...[open_close_link, fam_del_link]);
					
					const item = document.createElement('li');
					item.style.fontFamily = String(value.family).split(' ').join('-') + '-downloaded';
					item.dataset.id = value.id;
					item.append(...[title, fonts]);
					
					fragment.appendChild(item);
					
					cursor.continue();
				} else {
					downloaded_font_face.forEach((font) => {
						font.load().then(function(loaded_face) {
							document.fonts.add(loaded_face)
						}).catch(function(error) {
							console.error(error);
						});
					});
					this.downloaded_fonts_list.innerHTML = '';
					this.downloaded_fonts_list.appendChild(fragment);
					resolve(downloaded_fonts_list_items);
				}
			}
		});
	}
}

window.GWHelper = GWHelper;










