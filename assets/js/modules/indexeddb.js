class IndDB {
	constructor(args) {
		// Object.assign(this, args);
		this.db_name = args.db_name;
		this.db_version = args.db_version;
		this.db = null;
	}
	
	open(handlers = {}) {
		return new Promise((resolve, reject) => {
			const request_db = indexedDB.open(this.db_name, this.db_version);
			request_db.onupgradeneeded = (e) => {
				if ('upgrade' in handlers) handlers.upgrade(e, this);
			}
			request_db.onerror = (err) => reject(('error' in handlers) ? handlers.error(err, this) : (err.target.error || err));
			request_db.onblocked = (e) => console.warn("Your database version can't be upgraded because the app is open somewhere else.", e);
			request_db.onsuccess = (e) => {
				this.db = ('success' in handlers) ? handlers.success(e, this) : e.target.result;
				resolve(`Database ${this.db_name}, version "${this.db_version}" is opened!`);
			}
		})
	}
	
	delete() {
		return new Promise((resolve, reject) =>{
			this.db?.close();
			const delete_db = indexedDB.deleteDatabase(this.db_name);
			['error', 'blocked'].forEach((evt) =>
				delete_db.addEventListener(evt, (e) => {
					let message = (e.type === 'error') ? "Couldn't delete database" : "Couldn't delete database due to the operation being blocked" ;
					reject(message + (e.target.error || e));
				}, false)
			);
			
			delete_db.onsuccess = () => {resolve(`Deleted database ${this.db_name} successfully!`)}
		});
	}
	
	/**
	 * type - 'readwrite' or 'readonly'
	 * */
	_transaction(stores, handlers = {}, type = 'readonly'){
		let transaction = this.db.transaction(stores, type);
		transaction.oncomplete = (e) => {
			/** TODO: display in warnings */
			if ('complete' in handlers) handlers.complete(e, this);
		}
		transaction.onerror = (err) => {
			console.error('Transaction not opened due to error!!!');
			if ('error' in handlers) handlers.error(err, this);
		}
		transaction.onabort = (e) => {
			console.error('Transaction was aborted');
			if ('abort' in handlers) handlers.abort(e, this);
		};
		return transaction;
	}
	
	
	_dataValidate(stores, queries, handlers, transaction) {
		
		/** TODO: валидацию нужно переделать */
		if (!Array.isArray(stores)) stores = Array.from([stores]);
		if (!Array.isArray(handlers)) handlers = Array.from([handlers]);
		
		if (!Array.isArray(queries) || queries.length !== stores.length) {
			if (!Array.isArray(queries)) console.error('Data is not Array!');
			if (queries.length !== stores.length) console.error('The lengths of the arrays "stores" and "data" do not match!');
			transaction.abort();
			return false;
		} else return {stores, queries, handlers};
	}
	
	
	setStoreData(stores, queries, handlers = ()=>{}) {
		return new Promise((resolve, reject) =>{
			let transactionHandlers = {
				complete: (e) => {resolve(e)},
				error: (err) => {reject(err)},
				abort: (e) => {reject(e)}
			}
			
			let transaction = this._transaction(stores, transactionHandlers,'readwrite');
			
			({stores, queries, handlers} = this._dataValidate(stores, queries, handlers, transaction));
			
			if (stores && queries) {
				for (let i = 0; i < stores.length; i++) {
					let store = transaction.objectStore(stores[i]);
					queries[i].forEach((d) => {
						// handlers(d);
						let request = store.put(d);
						request.onerror = (err) => {
							/**
							 * TODO: хз, работает ли это построение, надо проверить ;)
							 * */
							console.error(`Add data request "<pre>${d => {
								if (d !== null) {
									if (typeof d === 'string') {
										return d;
									} else {
										return JSON.stringify(d, null, '\t');
									}
								} else {
									return null;
								}
							}}<pre>" rejected`);
							reject(err.target.error || err);
						}
					});
				}
			}
		});
	}
	
	
	/**
	 * query = {
	 *     store: string,
	 *     condition: boolean,
	 *     index: string,
	 *     value: string
	 * }
	 *
	 * @param {object} query - The object argument.
	 * @param {string} query.store - Store name.
	 * @param {boolean} [query.condition] - Query condition.
	 * @param {string} [query.index] - Query index.
	 * @param {(string|null)} [query.value] - Query value.
	 * @return {object} e.target.result - Search result.
	 * */
	getAllData(query) {
		let {store: store_name, condition, index, value} = query;
		return new Promise((resolve) => {
			const store = this._transaction(store_name).objectStore(store_name);
			let request;
			
			if (condition) {
				request = store.index(index).getAll(value);
			} else request = store.getAll(value || null);
			
			request.onsuccess = (e) => {
				resolve(e.target.result);
			}
		});
	}
}

export { IndDB };
