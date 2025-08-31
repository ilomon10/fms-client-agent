export const isDirExists = (path: string) => {
  try {
    const dir = Deno.statSync(path);
    return dir.isDirectory;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }

    return false;
  }
};
