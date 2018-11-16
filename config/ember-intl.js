/*jshint node:true*/

module.exports = function(/* environment */) {
  return {
    /**
     * The locales that our application supports.
     *
     * This is optional and is automatically set if project stores translations
     * where ember-intl is able to look them up (<project root>/translations/).
     *
     * If the project relies on side-loading translations, then you must explicitly
     * list out the locales. i.e: ['en-us', 'en-gb', 'fr-fr']
     *
     * @property locales
     * @type {Array?}
     * @default "null"
     */
    locales: null,

    /**
     * autoPolyfill, when true will automatically inject the IntlJS polyfill
     * into index.html
     *
     * @property autoPolyfill
     * @type {Boolean}
     * @default "false"
     */
    autoPolyfill: false,

    /**
     * disablePolyfill prevents the polyfill from being bundled in the asset folder of the build
     *
     * @property disablePolyfill
     * @type {Boolean}
     * @default "false"
     */
    disablePolyfill: false,

    /**
     * prevents the translations from being bundled with the application code.
     * This enables asynchronously loading the translations for the active locale
     * by fetching them from the asset folder of the build.
     *
     * See: https://github.com/jasonmit/ember-intl/blob/master/docs/asynchronously-loading-translations.md
     *
     * @property publicOnly
     * @type {Boolean}
     * @default "false"
     */
    publicOnly: false,

    /**
     * cause a build error if ICU argument mismatches are detected.
     *
     * @property errorOnNamedArgumentMismatch
     * @type {Boolean}
     * @default "false"
     */
    errorOnNamedArgumentMismatch: false,

    /**
     * cause a build error if missing translations are detected.
     *
     * See https://github.com/jasonmit/ember-intl/blob/master/docs/missing-translations.md#throwing-a-build-error-on-missing-required-translation
     *
     * @property errorOnMissingTranslations
     * @type {Boolean}
     * @default "false"
     */
    errorOnMissingTranslations: false,

    /**
     * filter missing translations to ignore expected missing translations.
     *
     * See https://github.com/jasonmit/ember-intl/blob/master/docs/missing-translations.md#requiring-translations
     *
     * @property requiresTranslation
     * @type {Function?}
     * @default "function(){return true}"
     */
    requiresTranslation: undefined,

    /**
     * removes empty translations from the build output.
     *
     * @property stripEmptyTranslations
     * @type {Boolean}
     * @default false
     */
    stripEmptyTranslations: false
  };
};
