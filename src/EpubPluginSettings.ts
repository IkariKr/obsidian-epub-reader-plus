import { App, PluginSettingTab, Setting, type SettingDefinitionItem, TFolder, Vault } from "obsidian";
import EpubPlugin from "./EpubPlugin";
import type { ReaderBackgroundMode } from './readerBackground';

export interface EpubPluginSettings {
	scrolledView: boolean;
	mouseWheelPageTurn: boolean;
	readerBackgroundMode: ReaderBackgroundMode;
	readerBackgroundColor: string;
	notePath: string;
	useSameFolder: boolean;
	tags: string;
}

export const DEFAULT_SETTINGS: EpubPluginSettings = {
	scrolledView: false,
	mouseWheelPageTurn: true,
	readerBackgroundMode: 'theme',
	readerBackgroundColor: '#ffffff',
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

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Scrolled View',
				desc: 'This enables seamless scrolling between pages.',
				control: { type: 'toggle', key: 'scrolledView' },
			},
			{
				name: '滚轮翻页 / Mouse wheel page turn',
				desc: '在分页模式下，向上或向下滚动鼠标滚轮翻上一页或下一页。 / In paginated mode, the mouse wheel turns to the previous or next page.',
				control: { type: 'toggle', key: 'mouseWheelPageTurn' },
			},
			{
				name: '正文背景 / Reader background',
				desc: '默认使用 Obsidian 主题的正文背景色；也可以为 EPUB 指定背景色。 / By default, uses the Obsidian theme background; optionally choose a custom EPUB background.',
				control: {
					type: 'dropdown',
					key: 'readerBackgroundMode',
					options: { theme: '跟随 Obsidian 主题 / Follow theme', custom: '自定义颜色 / Custom color' },
				},
			},
			{
				name: '自定义正文背景色 / Custom reader background',
				visible: () => this.plugin.settings.readerBackgroundMode === 'custom',
				control: { type: 'color', key: 'readerBackgroundColor' },
			},
			{
				name: 'Same Folder',
				desc: 'When toggle on, the epub note file will be created in the same folder.',
				control: { type: 'toggle', key: 'useSameFolder' },
			},
			{
				name: 'Note Folder',
				desc: 'Choose the default epub note folder. When the Same Folder toggled on, this setting is ineffective.',
				control: { type: 'dropdown', key: 'notePath', options: getFolderOptions(this.app) },
			},
			{
				name: 'Tags',
				desc: 'Tags added to new note metadata.',
				control: { type: 'text', key: 'tags' },
			},
		];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as keyof EpubPluginSettings];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		switch (key) {
			case 'scrolledView':
			case 'mouseWheelPageTurn':
			case 'useSameFolder':
				if (typeof value === 'boolean') this.plugin.settings[key] = value;
				break;
			case 'readerBackgroundMode':
				if (value === 'theme' || value === 'custom') this.plugin.settings.readerBackgroundMode = value;
				break;
			case 'readerBackgroundColor':
			case 'notePath':
			case 'tags':
				if (typeof value === 'string') this.plugin.settings[key] = value;
				break;
			default:
				return;
		}

		await this.plugin.saveSettings();
		if (key === 'readerBackgroundMode' || key === 'readerBackgroundColor') {
			await this.plugin.refreshEpubViews();
		}
		this.update();
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName('EPUB Reader')
			.setHeading();

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

		const saveReaderBackgroundSettings = async () => {
			await this.plugin.saveSettings();
			await this.plugin.refreshEpubViews();
			this.display();
		};

		new Setting(containerEl)
			.setName("正文背景 / Reader background")
			.setDesc("默认使用 Obsidian 主题的正文背景色；也可以为 EPUB 指定背景色。 / By default, uses the Obsidian theme background; optionally choose a custom EPUB background.")
			.addDropdown(dropdown => dropdown
				.addOptions({ theme: '跟随 Obsidian 主题 / Follow theme', custom: '自定义颜色 / Custom color' })
				.setValue(this.plugin.settings.readerBackgroundMode)
				.onChange(async (value: ReaderBackgroundMode) => {
					this.plugin.settings.readerBackgroundMode = value;
					await saveReaderBackgroundSettings();
				}));

		if (this.plugin.settings.readerBackgroundMode === 'custom') {
			new Setting(containerEl)
				.setName("自定义正文背景色 / Custom reader background")
				.addColorPicker(color => color
					.setValue(this.plugin.settings.readerBackgroundColor)
					.onChange(async (value) => {
						this.plugin.settings.readerBackgroundColor = value;
						await saveReaderBackgroundSettings();
					}));
		}

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
