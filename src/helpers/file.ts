export const loadJSONFromFile = <T>(path: string) => {
  const rawContent = Deno.readTextFileSync(path);

  return <T>JSON.parse(rawContent);
};

export const isFileExists = (path: string) => {
  try {
    const dir = Deno.statSync(path);
    return dir.isFile;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }

    return false;
  }
};
