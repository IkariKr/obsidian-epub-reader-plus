import { App, PluginSettingTab, Setting, TFolder, Vault } from "obsidian";
import EpubPlugin from "./EpubPlugin";

export interface EpubPluginSettings {
	scrolledView: boolean;
	mouseWheelPageTurn: boolean;
	notePath: string;
	useSameFolder: boolean;
	tags: string;
}

export const DEFAULT_SETTINGS: EpubPluginSettings = {
	scrolledView: false,
	mouseWheelPageTurn: true,
	notePath: '/',
	useSameFolder: true,
	tags: 'notes/booknotes'
}

export class EpubSettingTab extends PluginSettingTab {
	plugin: EpubPlugin;

	constructor(app: App, plugin: EpubPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'EPUB Settings' });

		new Setting(containerEl)
			.setName("Scrolled View")
			.setDesc("This enables seamless scrolling between pages.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.scrolledView)
				.onChange(async (value) => {
					this.plugin.settings.scrolledView = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("滚轮翻页 / Mouse wheel page turn")
			.setDesc("在分页模式下，向上或向下滚动鼠标滚轮翻上一页或下一页。 / In paginated mode, the mouse wheel turns to the previous or next page.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.mouseWheelPageTurn)
				.onChange(async (value) => {
					this.plugin.settings.mouseWheelPageTurn = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Same Folder")
			.setDesc("When toggle on, the epub note file will be created in the same folder.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useSameFolder)
				.onChange(async (value) => {
					this.plugin.settings.useSameFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Note Folder")
			.setDesc("Choose the default epub note folder. When the Same Folder toggled on, this setting is ineffective.")
			.addDropdown(dropdown => dropdown
				.addOptions(getFolderOptions(this.app))
				.setValue(this.plugin.settings.notePath)
				.onChange(async (value) => {
					this.plugin.settings.notePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Tags")
			.setDesc("Tags added to new note metadata.")
			.addText(text => {
				text.inputEl.size = 50;
				text
					.setValue(this.plugin.settings.tags)
					.onChange(async (value) => {
						this.plugin.settings.tags = value;
						await this.plugin.saveSettings();
					})
			});
	}
}

function getFolderOptions(app: App) {
	const options: Record<string, string> = {};

	Vault.recurseChildren(app.vault.getRoot(), (f) => {
		if (f instanceof TFolder) {
			options[f.path] = f.path;
		}
	});

	return options;
}
