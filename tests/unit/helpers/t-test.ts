import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { gte } from 'ember-compatibility-helpers';
import tHelper from 'ember-intl/helpers/t';
import type { TestContext } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

const DEFAULT_LOCALE = 'en-us';

module('t', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(
    hooks,
    DEFAULT_LOCALE,
    {
      html: {
        greeting: "'<strong>'Hello {name} {count, number}'</strong>'",
        legacy: `<a href="{href}">{text}</a>`,
      },
      number: 2,
      foo: {
        bar: 'foo bar baz',
        baz: 'baz baz baz',
      },
    },
    {
      missingMessage: false,
      formats: {
        date: {
          shortWeekDay: {
            timeZone: 'UTC',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          },
        },
      },
    }
  );

  test('exists', function (this: TestContext, assert) {
    assert.expect(1);
    assert.ok(tHelper);
  });

  test('should return nothing if key does not exist and allowEmpty is set to true', async function (this: TestContext, assert) {
    assert.expect(1);
    this.intl.addTranslations(DEFAULT_LOCALE, { empty: '' });
    await render(hbs`{{t 'does.not.exist' default='empty'}}`);
    assert.strictEqual(this.element.textContent, '');
  });

  test('should return a number string if translation is a number', async function (this: TestContext, assert) {
    await render(hbs`{{t 'number'}}`);
    assert.strictEqual(this.element.textContent, '2');
  });

  test('should escape attributes but not the translation string', async function (this: TestContext, assert) {
    assert.expect(3);
    await render(hbs`{{t 'html.greeting' htmlSafe=true name="<em>Jason</em>" count=42000}}`);
    assert.strictEqual(this.element.querySelectorAll('strong').length, 1);
    assert.strictEqual(this.element.querySelectorAll('em').length, 0);
    assert.strictEqual(
      (this.element as HTMLElement).innerHTML,
      `<strong>Hello &lt;em&gt;Jason&lt;/em&gt; 42,000</strong>`
    );
  });

  test('should support legacy HTML escaping', async function (this: TestContext, assert) {
    assert.expect(3);
    await render(hbs`{{t 'html.legacy' htmlSafe=true text="<em>Jason</em>" href="/foo"}}`);
    assert.strictEqual(this.element.querySelectorAll('a').length, 1);
    assert.strictEqual(this.element.querySelectorAll('em').length, 0);
    assert.strictEqual((this.element as HTMLElement).innerHTML, `<a href="/foo">&lt;em&gt;Jason&lt;/em&gt;</a>`);
  });

  test('should support optional positional options object argument', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`
      {{t 'html.greeting' (hash name="Jason" count=42)}}
    `);
    assert.true(this.element.textContent?.includes('<strong>Hello Jason 42</strong>'));
  });

  test('should overried optional positional options argument properties with named arguments', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`
      {{t 'html.greeting' (hash name="Jason" count=42) count=39.99}}
    `);
    assert.true(this.element.textContent?.includes('<strong>Hello Jason 39.99</strong>'));
  });

  test('should render a TextNode', async function (this: TestContext, assert) {
    assert.expect(2);
    await render(hbs`{{t 'html.greeting' name="<em>Jason</em>" count=42000}}`);
    assert.strictEqual(this.element.querySelectorAll('em').length, 0);
    assert.strictEqual(this.element.querySelectorAll('strong').length, 0);
  });

  test('should support allowEmpty', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{t allowEmpty=true}}`);
    assert.strictEqual(this.element.textContent, '');
  });

  test('locale can add message to intl service and read it', async function (this: TestContext, assert) {
    assert.expect(1);

    this.intl.addTranslations(DEFAULT_LOCALE, { oh: 'hai!' });
    await render(hbs`{{t 'oh'}}`);
    assert.strictEqual(this.element.textContent, 'hai!');
  });

  test('translation value can be an empty string', async function (this: TestContext, assert) {
    assert.expect(1);

    this.intl.addTranslations(DEFAULT_LOCALE, { empty_translation: '' });
    await render(hbs`{{t 'empty_translation'}}`);
    assert.strictEqual(this.element.textContent, '');
  });

  test('locale can add messages object and can read it', async function (this: TestContext, assert) {
    assert.expect(1);

    this.intl.addTranslations(DEFAULT_LOCALE, { bulk_add: 'bulk add works' });
    await render(hbs`{{t 'bulk_add'}}`);
    assert.strictEqual(this.element.textContent, 'bulk add works');
  });

  test('can inline locale for missing locale', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{t 'foo.bar' locale='fr'}}`);
    assert.strictEqual(this.element.textContent, 'Missing translation "foo.bar" for locale "fr"');
  });

  test('warns when no locale has been set', async function (this: TestContext, assert) {
    assert.expect(1);
    assert.throws(
      () =>
        // @ts-expect-error This is undesired private behavior.
        this.intl.setLocale(null),
      /no locale has been set/
    );
  });

  test('should cascade translation keys', async function (this: TestContext, assert) {
    assert.expect(1);
    this.intl.addTranslations('en-us', { happy_birthday: 'You are {age, number} years old!' });
    await render(hbs`{{t 'does.not.exist' default='happy_birthday' age=10}}`);
    assert.strictEqual(this.element.textContent, 'You are 10 years old!');
  });

  test('should throw when unknown key type is provided', async function (this: TestContext, assert) {
    assert.expect(6);

    const assertInvalidTranslationKey = (input: unknown) => {
      let error;

      try {
        this.intl.t(input as any);
      } catch (e) {
        error = e;
      }

      assert.ok(error.message.includes('expected translation key'));
    };

    assertInvalidTranslationKey(null);
    assertInvalidTranslationKey(undefined);
    assertInvalidTranslationKey(false);
    assertInvalidTranslationKey([]);
    assertInvalidTranslationKey({});
    assertInvalidTranslationKey(1);
  });

  // Autotracking was added in Ember 3.13, so this test isn't applicable to earlier versions
  if (gte('3.13.0')) {
    test('current locale entangles with autotracking', async function (this: TestContext, assert) {
      this.intl.addTranslations('en-us', { greeting: 'Hello' });
      this.intl.addTranslations('fr-fr', { greeting: 'Bonjour' });

      // Define a native getter that calls intl.t()
      Object.defineProperty(this, 'translatedGreeting', {
        get() {
          return this.intl.t('greeting');
        },
      });

      this.intl.setLocale(['en-us']);
      await render(hbs`{{this.translatedGreeting}}`);
      assert.strictEqual(this.element.textContent, 'Hello');

      this.intl.setLocale(['fr-fr']);
      await settled();
      assert.strictEqual(this.element.textContent, 'Bonjour');
    });
  }
});
