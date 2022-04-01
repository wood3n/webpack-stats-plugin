const gzip = require('gzip-size');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table');
const fs = require('fs');
const humanFileSize = require('filesize');

class StatsPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('StatsPlugin', (stats) => {
      console.log(chalk.green('compiled successfully'));
      const outputPath = compiler.outputPath;
      const excludes = ['.map', '.txt', '.html'];

      try {
        // webpack 这边输出的资源大小使用的是 byte 为单位的
        // 对资源按照文件类型进行分组
        const assetsGroups = Object.entries(stats.compilation.assets).reduce(
          (result, [filename, { _size }]) => {
            const ext = path.extname(filename);
            const extname = ext.split('.')[1];
            if (!excludes.includes(ext)) {
              const group = result[extname];
              const filepath = path.join(outputPath, filename);
              const fileContent = fs.readFileSync(filepath);
              const assetInfo = {
                filename: path.basename(filename),
                filepath,
                filesize: humanFileSize(_size),
                gzipsize: humanFileSize(gzip.sync(fileContent)),
              };

              if (group) {
                group.push(assetInfo);
              } else {
                result[extname] = [assetInfo];
              }
            }

            return result;
          },
          {}
        );

        Object.entries(assetsGroups).forEach(([groupName, assets]) => {
          console.log();
          console.log(chalk.blue(groupName));
          console.log('             ');
          const table = new Table({
            head: ['', 'filepath', 'filesize', 'gzip-size'],
            colWidths: [10, 80, 15, 15],
          });

          assets.forEach(({ filepath, filesize, gzipsize }) => {
            table.push({
              [groupName]: [filepath, filesize, gzipsize],
            });
          });

          console.log(table.toString());
        });
      } catch (err) {
        console.log(err.stack);
      }
    });
  }
}

module.exports = StatsPlugin;
