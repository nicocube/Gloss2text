#!/usr/bin/env node

try {
  'use strict'
  var meow = require('meow')
    , chalk = require('chalk')

  // temporary test of meow
  var cli = meow(
    '\n  Usages\n'+
    '    $ gloss2text\n\n'+
    '      This documentation.\n'+
    '\n'+
    '    $ gloss2text <grammarfile>\n'+
    '\n'+
    '      Options\n'+
    '        -c, --count\tcount lexicon entries\n'+
    '\n'+
    '    $ gloss2text <grammarfile> <glossfile>\n'+
    '\n'+
    '      Options\n'+
    '        -o, --out\tfile to send output to (otherwise goes to command-line)\n'+
    '        -i, --interlinear\toutput both result text on one line and original gloss under\n'+
    '\n'+
    '      Examples\n'+
    '        $ gloss grammar.json gloss.txt -i\n',
    '        $ gloss grammar.yml gloss.txt -i -o glossed.txt\n',
    {
      alias: {
        o: 'output',
        i: 'interlinear',
        c: 'count',
        
      }
    }
  )

  if (cli.input.length==0 && Object.keys(cli.flags).length==0) {
    cli.showHelp()
  } else {
    //console.log(cli.input)
    //console.log(cli.flags)

    var parser_builder = require(__dirname+'/lib/parser.js')
      , fs = require('fs')
      , yaml = require('js-yaml')
      , parse = /yml$/.test(cli.input[0]) ? yaml.safeLoad : JSON.parse

    if (cli.input.length==1) {
      var grammar_analyser = require(__dirname+'/lib/grammar_analyser.js')(parse(fs.readFileSync(cli.input[0], 'utf8')))
      if (cli.flags.c) {
        console.log('lexicon entries: '+grammar_analyser.count())
      }
    } else if (cli.input.length==2) {
      var parser = parser_builder(parse(fs.readFileSync(cli.input[0], 'utf8')))
        , text = fs.readFileSync(cli.input[1], 'utf8')
        , lines = text.split('\n')
        , x = undefined

      lines.forEach(function(l) {
        if (/^\s*$/.test(l) || l.startsWith('>')) {
          process.stdout.write(l+'\n')
        } else if (l.startsWith('#')) {
          x = l.replace(/^#\s*/,'')
        } else {
          var p = parser(l)
          if (typeof x !== 'undefined' && p !== x) {
            process.stdout.write(chalk.red('Expect: '+x)+'\n')
            process.stdout.write(chalk.red('Actual: '+p)+'\n')
          } else {
            process.stdout.write(chalk.cyan(p)+'\n')
          }
          if (cli.flags.i) process.stdout.write(chalk.yellow(l)+'\n')
          x = undefined
        }
      })
    }
  }

//*
} catch(e) {
  process.stderr.write(chalk.magenta('ERROR:'+e.message+'\n'))
  process.exit(1)
//*/
} finally {
  process.exit(0)
}
