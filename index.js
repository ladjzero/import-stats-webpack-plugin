const chalk = require("chalk");
const columnify = require('columnify');

const defaultOptions = {
  imports: [],
  print: (results, libName) => {
    const result = results[libName];
    let sum = 0;
    const vm = Object.keys(result).map(key => ({ IMPORT: key, COUNT: (sum+=result[key],result[key])})).sort((l, r) => l.COUNT - r.COUNT).reverse();
    console.info('[ImportStatsPlugin]', chalk.green(libName), `total: ${sum}`);    
    console.info(columnify(vm));
  }
};

class ImportStatsPlugin {
  constructor(options) {
    Object.assign(this, defaultOptions, options);
    this.results = {};
  }

  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap("ImportStatsPlugin", factory => {
      factory.hooks.parser.for("javascript/auto").tap("ImportStatsPlugin", parser => {
        parser.hooks.import.tap("ImportStatsPlugin", astNode => {
          this.imports.forEach(lib => {
            if (astNode.source.value === lib) {
              this.results[lib] = this.results[lib] || {};
  
              astNode.specifiers.forEach(specifier => {
                switch (specifier.type) {
                  case 'ImportDefaultSpecifier':
                      this.results[lib].default = (this.results[lib].default || 0) + 1;
                    break;
                  case 'ImportSpecifier':
                      this.results[lib][specifier.imported.name] = (this.results[lib][specifier.imported.name] || 0) + 1;
                    break;
                }
              }) 
            }
          })
        });
      });
    });

    compiler.hooks.done.tap("ImportStatsPlugin", () => {
      this.imports.forEach(lib => {
        this.print(this.results, lib);
      })
    });
  }
}

module.exports = ImportStatsPlugin;
