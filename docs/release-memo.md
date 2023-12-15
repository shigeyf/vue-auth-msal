# Release memos

## How to release

1. Point a local working folder to a specific commit of branch (ususaly `main` branch) for a release.

   - This commit must include an updated package.json, in where **version** field is updated.

2. Add a release tag to the local working repository.

   ```bash
   git tag -a <tag_name> -m "message"

   ex)
   git tag -a v1.0.0 -m "v1.0.0"
   ```

3. Push the tag information to the remote repository (typically github repository).

   ```bash
   git push --tags
   ```

4. Release this commit as a new npm package.

   ```bash
   npm publish
   ```
