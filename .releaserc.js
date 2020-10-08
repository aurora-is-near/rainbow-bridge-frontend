module.exports = {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular'
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular'
      }
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): ${nextRelease.version} [ci skip]'
      }
    ],
    '@semantic-release/github'
  ]
}
