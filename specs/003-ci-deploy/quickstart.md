# Quickstart: Continuous Integration and Production Deploy

## Run the checks locally

```sh
npm run check          # type check, lint, unit tests
npm run build
npm run verify:dist
npm run verify:hosting
npm run lighthouse     # set CHROME_PATH if Chrome is not found
```

## After the first CI run (repository owner, once)

With the GitHub CLI logged in as an owner of the repository:

```sh
gh api -X PUT repos/Levix-Digital/levix-digital-website/environments/production \
  -F "deployment_branch_policy[protected_branches]=false" -F "deployment_branch_policy[custom_branch_policies]=true"
gh api -X POST repos/Levix-Digital/levix-digital-website/environments/production/deployment-branch-policies -f name=main -f type=branch
```

Then Settings, Branches (or Rules), protect `main`: require a pull request, require the status checks `check (ubuntu-latest, 22)`, `check (ubuntu-latest, 24)`, `check (windows-latest, .nvmrc)` and `build`, require conversation resolution, block force pushes.

## Publish

- Merge a pull request into `main`: `Deploy` publishes the sites it changed.
- By hand: Actions, Deploy, Run workflow; leave `sites` empty for every site or write `gedo aurora`.

## Hand checks for the reviewer

- This pull request shows the `CI` checks green and the Lighthouse reports as an artifact.
- After the merge: the `Deploy` run publishes every site (this change touches the build), the `production` environment lists the deploy, and each `https://<site>.web.app` answers.
