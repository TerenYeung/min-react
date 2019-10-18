import escapeTextContentForBrowser from './escapeTextContentForBrowser';

function quoteAttributeValueForBrowser(value) {
  return '"' + escapeTextContentForBrowser(value) + '"';
}

export default quoteAttributeValueForBrowser;
