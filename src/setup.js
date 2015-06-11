import {
  readFileSync as readFile,
  writeFileSync as writeFile
} from 'fs'

import ini from 'ini'
import ghUrl from 'github-url-from-git'

export default function () {
  let pkg = JSON.parse(String(readFile('./package.json')))

  // ensure a yet unpublished version
  pkg.version = '0.0.0-semantically-released'

  // set up scripts
  const pre = 'semantic-release pre'
  const post = 'semantic-release post'

  if (!pkg.scripts) pkg.scripts = {}

  if (!pkg.scripts.prepublish) pkg.scripts.prepublish = pre
  else if (!(new RegExp(pre).test(pkg.scripts.prepublish))) pkg.scripts.prepublish += ` && ${pre}`

  if (!pkg.scripts.postpublish) pkg.scripts.postpublish = post
  else if (!(new RegExp(post).test(pkg.scripts.postpublish))) pkg.scripts.postpublish += ` && ${post}`

  // set up repository
  if (!pkg.repository || !pkg.repository.url) {
    const config = ini.decode(String(readFile('./.git/config')))
    const repo = config['remote "origin"'].url

    if (repo) pkg.repository = { type: 'git', url: ghUrl(repo) }
  }

  // set up devDependency
  if (!pkg.devDependencies) pkg.devDependencies = {}

  if (!pkg.devDependencies['semantic-release']) {
    pkg.devDependencies['semantic-release'] = `^${require('../package.json').version}`
  }

  writeFile('./package.json', `${JSON.stringify(pkg, null, 2)}\n`)
}
