module.exports = {
    // ...
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'me',
                    name: 'awesome-thing'
                },
                prerelease: true
            }
        }
    ]
}