# gwh-ui
google-webfonts-helper user interface

This is nothing more than an attempt to make downloading google fonts more convenient. 
The coolest [google-webfonts-helper](https://google-webfonts-helper.herokuapp.com/fonts) from
[Mario Ranftl](https://mranftl.com/) - [@majodev](https://github.com/majodev) ([License](https://majodev.mit-license.org/))  to download the base and font files, 
as well as directly [Google Fonts](https://fonts.google.com/) ([License](https://fonts.google.com/attribution)) as a source of design, 
functionality and preview fonts.

### Links List:
1. [google-webfonts-helper](https://google-webfonts-helper.herokuapp.com/fonts)
2. [google-webfonts-helper (github.com)](https://github.com/majodev/google-webfonts-helper)
3. [indexedDB example from MDN (mdn.github.i)](http://mdn.github.io/to-do-notifications/)

## Init:

```javascript
new GWHelper({
    open_btn: '#GWH_open_btn'
});
```

### TODO List:
- [ ] Tidy up the appearance.
- [ ] Removing the base of available fonts.
- [ ] Removing the base and files of downloaded fonts.
- [ ] Loader when loading google fonts via css. Presumably with the help of [Font Face Observer](https://fontfaceobserver.com/).
- [ ] In the background, through the serviceWorker, check the relevance of the database (both plugin and google-webfonts-helper).
- [ ] Write comments using [JSDoc](https://jsdoc.app/).
- [ ] Maybe tests will appear over time.
- [ ] Remake _createDownloadedFontsList.
- [ ] Callbacks after loading fonts, etc.
- [ ] Checking font caching. Presumably with the help of [CacheStorage API](https://developer.mozilla.org/ru/docs/Web/API/CacheStorage).
