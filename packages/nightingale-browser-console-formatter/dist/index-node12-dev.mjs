import { formatRecordToString, styleToHtmlStyle } from 'nightingale-formatter';

const style = args => (styles, string) => {
  if (!styles || styles.length === 0 || !string) {
    return string;
  }

  const htmlStyles = styles.map(styleName => styleToHtmlStyle[styleName]);
  args.push(htmlStyles.map(s => s.open).join('; '));
  args.push(htmlStyles.map(s => s.close).join('; '));
  return `%c${string}%c`;
};
function format(record) {
  const args = [];
  const string = formatRecordToString(record, style(args));
  return [string, ...args];
}

export default format;
export { style };
//# sourceMappingURL=index-node12-dev.mjs.map