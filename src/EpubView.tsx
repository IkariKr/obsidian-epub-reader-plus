import { WorkspaceLeaf, FileView, TFile, Menu, moment } from "obsidian";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { EpubPluginSettings } from "./EpubPluginSettings";
import { EpubReader } from "./EpubReader";

export const EPUB_FILE_EXTENSION = "epub";
export const VIEW_TYPE_EPUB = "epub-reader-plus";
export const ICON_EPUB = "doc-epub";

export class EpubView extends FileView {
  allowNoFile: false;

  constructor(leaf: WorkspaceLeaf, private settings: EpubPluginSettings) {
    super(leaf);
  }

  onPaneMenu(menu: Menu, source: 'more-options' | 'tab-header' | string): void {
    menu.addItem((item) => {
      item
        .setTitle("Create new epub note")
        .setIcon("document")
        .onClick(async () => {
          const fileName = this.getFileName();
          let file = this.app.vault.getAbstractFileByPath(fileName);
          if (file == null || !(file instanceof TFile)) {
            file = await this.app.vault.create(fileName, this.getFileContent());
          }
          const fileLeaf = this.app.workspace.createLeafBySplit(this.leaf);
          fileLeaf.openFile(file as TFile, {
            active: true
          });
        });
    });
    menu.addSeparator();
    super.onPaneMenu(menu, source);
  }

  getFileName() {
    let filePath;
    if (this.settings.useSameFolder) {
      filePath = `${this.file.parent.path}/`;
    } else {
      filePath = this.settings.notePath.endsWith('/')
        ? this.settings.notePath
        : `${this.settings.notePath}/`;
    }
    return `${filePath}${this.file.basename}.md`;
  }

  getFileContent() {
    return `---
Tags: ${this.settings.tags}
Date: ${moment().toLocaleString()}
---

# ${this.file.basename}
`;
  }

  async onLoadFile(file: TFile): Promise<void> {
    ReactDOM.unmountComponentAtNode(this.contentEl);
    this.contentEl.empty();
    this.contentEl.addClass('epub-reader-plus-view');
    const contents = await this.app.vault.adapter.readBinary(file.path);
    ReactDOM.render(
      <EpubReader
        contents={contents}
        title={file.basename}
        scrolled={this.settings.scrolledView}
        mouseWheelPageTurn={this.settings.mouseWheelPageTurn}
        readerBackgroundMode={this.settings.readerBackgroundMode}
        readerBackgroundColor={this.settings.readerBackgroundColor} />,
      this.contentEl
    );
  }

  onunload(): void {
    ReactDOM.unmountComponentAtNode(this.contentEl);
  }

  getDisplayText() {
    if (this.file) {
      return this.file.basename;
    } else {
      return 'No File';
    }
  }

  canAcceptExtension(extension: string) {
    return extension == EPUB_FILE_EXTENSION;
  }

  getViewType() {
    return VIEW_TYPE_EPUB;
  }

  getIcon() {
    return ICON_EPUB;
  }
}
