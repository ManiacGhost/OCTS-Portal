/** The first name to greet someone by — never a title such as "Dr." or "Ms.". */
export const firstName = (fullName: string): string =>
  fullName
    .trim()
    .replace(/^((dr|mr|mrs|ms|miss|mx|prof|sir)\.?\s+)+/i, '')
    .split(/\s+/)[0] || fullName;
