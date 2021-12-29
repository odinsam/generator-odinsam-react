'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const glob = require('glob-promise');
const pkg = require('../../package.json');
const copyFiles = async (src, dest) => {
    console.log('src: ', src);
    console.log('dest: ', dest);
    // package.json 和 模板文件不拷贝，后续单独处理
    const files = await glob(`${src}/**/!(package.json)`, {
        nodir: true
    });
    console.log('将要拷贝：', files);

    files.forEach(async (file) => {
        const dir = path.relative(src, file);
        await fse.copy(file, path.join(dest, dir), { overwrite: true });
    });

    // .gitignore 点开头的文件单独拷贝
    await fse.copySync(`${src}/.gitignore`, `${dest}/.gitignore`, {
        overwrite: true
    });
};

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        // 执行 yo template templateName
        // options支持：type，require，default，desc
        this.argument('appname', { type: String, required: true }); // appname is templateName
        // this.log(this.options.appname); // my-first-yo-project

        // 执行 yo template templateName --ts
        // options支持：type，alias，default，desc，hide
        this.option('ts'); // ts is args
        // this.log(this.options.ts); // true

        this.log(chalk.bold.green('执行 app 模板'));
        if (fs.existsSync('src')) {
            // 检查脚手架是否已经存在
            this.log(
                chalk.bold.green('src 目录已存在，资源已经初始化，退出...')
            );
            process.exit(1);
        }
        this.myInfo = null;
        this.config.save(); // 生成 .yo-rc.json 文件。Yeoman通过这个文件知道该目录是根目录
    }

    prompting() {
        // Have Yeoman greet the user.
        this.log(
            yosay(
                `Welcome to the doozie ${chalk.red(
                    'odinsam-react'
                )}-v${chalk.green(`${pkg.version}`)} generator!`
            )
        );

        const questions = [
            // {
            //   name: "projectAssets",
            //   type: "list",
            //   message: "请选择模板:",
            //   choices: [
            //     {
            //       name: "PC",
            //       value: "pc",
            //       checked: true
            //     },
            //     {
            //       name: "App",
            //       value: "app"
            //     }
            //   ]
            // },
            {
                type: 'input',
                name: 'projectAuthor',
                message: '项目开发者',
                store: true, // 记住用户的选择
                default: 'odinsam'
            }
        ];

        return this.prompt(questions).then((answers) => {
            // To access props later use this.props.someAnswer;
            this.log('answers: ', JSON.stringify(answers)); // 推荐用 this.log，而不是 console.log
            this.prjInfo = answers; // 公共变量可以保存到 this 上，共后续方法使用
        });
    }

    async writing() {
        this.log(
            `开始将 ${this.sourceRoot()} 里的模板拷贝至 ${this.destinationRoot()} 目录中...`
        );

        // templates目录里，除模板文件外都无脑拷贝
        await copyFiles(
            path.join(__dirname, 'templates'),
            this.destinationRoot()
        );

        // 开始处理模板文件
        this.fs.copyTpl(
            this.templatePath('package.json'), // 默认路径就是 templates 目录
            this.destinationPath('package.json'), // 目标文件夹的根目录下新建文件
            {
                projectName: this.options.appname,
                projectAuthor: this.prjInfo.projectAuthor
            }
        );
        // this.fs.copyTpl(
        //   this.templatePath("./src/index.html"),
        //   this.destinationPath("./src/index.html"),
        //   { title: this.myInfo.pageTitle }
        // );

        const pkgJson = {
            // devDependencies: {
            //     eslint: '^3.15.0'
            // },
            dependencies: {
                '@craco/craco': '^5.9.0',
                '@testing-library/jest-dom': '^5.14.1',
                '@testing-library/react': '^12.0.0',
                '@testing-library/user-event': '^13.2.1',
                '@types/jest': '^27.0.1',
                '@types/node': '^16.7.13',
                '@types/react': '^17.0.20',
                '@types/react-dom': '^17.0.9',
                'antd-mobile': '^5.0.0-rc.9',
                'craco-antd': '^1.19.0',
                'craco-less': '^2.0.0',
                react: '^17.0.2',
                'react-dom': '^17.0.2',
                'react-scripts': '5.0.0',
                typescript: '^4.4.2',
                'web-vitals': '^2.1.0'
            }
        };
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    }

    install() {
        this.installDependencies({
            yarn: true,
            npm: true,
            bower: false // 不使用 bower
        });
    }
};
