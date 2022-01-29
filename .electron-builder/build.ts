import * as builder from 'electron-builder'

const main = async() => {
  await builder.build({
    targets: builder.Platform.LINUX.createTarget(),
    config: {
      compression: 'normal',
      target: ['deb'],
      directories: {
        output: 'out',
      },
      extraResources: 'dist',
      files: [
        '**/*',
        '!aion.json',
        '!out/*',
        '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
        '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
        '!**/node_modules/*.d.ts',
        '!**/node_modules/.bin',
        '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
        '!.editorconfig',
        '!**/._*',
        '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
        '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
        '!**/{appveyor.yml,.travis.yml,circle.yml}',
        '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
      ],
      linux: {
        desktop: {
          target: ['deb'],
        },
      },
    },
  })
}

main()
