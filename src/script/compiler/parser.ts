import { EmbeddedActionsParser } from "chevrotain";
import { DebugRules } from "./debug/debug.rules";
import { DisplayRules } from "./display/display.rules";
import { ActionRules } from "./display/layout/action.rules";
import { DefAnimRules } from "./display/layout/defanim.rules";
import { ForRules } from "./display/layout/for.rules";
import { ImageRules } from "./display/layout/image.rules";
import { LayoutRules } from "./display/layout/layout.rules";
import { MenuRules } from "./display/layout/menu.rules";
import { ParmsRules } from "./display/layout/parms.rules";
import { RectRules } from "./display/layout/rect.rules";
import { RepeatRules } from "./display/layout/repeat.rules";
import { SetRules } from "./display/layout/set.rules";
import { SpriteRules } from "./display/layout/sprite.rules";
import { TextSpritePropsRules } from "./display/layout/text-sprite-props.rules";
import { TextRules } from "./display/layout/text.rules";
import { ViewRules } from "./display/layout/view.rules";
import { MiscRules } from "./display/misc.rules";
import { OnRules } from "./display/on.rules";
import { SoundRules } from "./display/sound.rules";
import { TimerRules } from "./display/timer.rules";
import { UIRules } from "./display/ui.rules";
import { EditorRules } from "./editor/editor.rules";
import { GameRules } from "./game/game.rules";
import { LevelRules } from "./level/level.rules";
import { tokenList } from "./lexer";
import { TypesRules } from "./types.rules";

export class SheetParser extends EmbeddedActionsParser {
	constructor() {
		super(tokenList);
		this.performSelfAnalysis();
	}

	public variablesDict = new Map();

	public sheet = this.RULE("sheet", () => {
		return this.OR([
			{ ALT: () => this.SUBRULE(this.displaySheet) },
			{ ALT: () => this.SUBRULE(this.gameSheet) },
			{ ALT: () => this.SUBRULE(this.levelSheet) },
			{ ALT: () => this.SUBRULE(this.editorSheet) },
			{ ALT: () => this.SUBRULE(this.debugSheet) },
		]);
	});

	public number = TypesRules.number(this);
	public variable = TypesRules.variable(this);
	public htmlColor = TypesRules.htmlColor(this);
	public numOrVar = TypesRules.numOrVar(this);
	public strOrVar = TypesRules.strOrVar(this);
	public varOrArrayOfVars = TypesRules.varOrArrayOfVars(this);
	public arrayOfVars = TypesRules.arrayOfVars(this);

	public displaySheet = DisplayRules.displaySheet(this);
	public displayProps = DisplayRules.displayProps(this);
	public displayLayers = DisplayRules.displayLayers(this);
	public displaySettings = DisplayRules.displaySettings(this);
	public displaySet = DisplayRules.displaySet(this);

	public sound = SoundRules.sound(this);

	public layout = LayoutRules.layout(this);
	public layoutStatement = LayoutRules.layoutStatement(this);
	public parm_at = ParmsRules.parm_at(this);
	public parm_range = ParmsRules.parm_range(this);
	public parm_dir = ParmsRules.parm_dir(this);
	public layoutText = TextRules.layoutText(this);
	public layoutAction = ActionRules.layoutAction(this);
	public layoutActionBlock = ActionRules.layoutActionBlock(this);
	public layoutActionStatement = ActionRules.layoutActionStatement(this);
	public layoutActionFunctionCall = ActionRules.layoutActionFunctionCall(this);
	public layoutActionFunctionName = ActionRules.layoutActionFunctionName(this);
	public layoutSprite = SpriteRules.layoutSprite(this);
	public layoutImage = ImageRules.layoutImage(this);
	public textSpriteProps = TextSpritePropsRules.textSpriteProps(this);
	public layoutMenu = MenuRules.layoutMenu(this);
	public layoutMenuItems = MenuRules.layoutMenuItems(this);
	public layoutMenuItem = MenuRules.layoutMenuItemGroup(this);
	public layoutMenuSelection = MenuRules.layoutMenuSelection(this);
	public layoutMenuSelectionColor = MenuRules.layoutMenuSelectionColor(this);
	public layoutMenuSelectionSprite = MenuRules.layoutMenuSelectionSprite(this);
	public layoutSet = SetRules.layoutSet(this);
	public layoutSetValue = SetRules.layoutSetValue(this);
	public layoutSetValueArray = SetRules.layoutSetValueArray(this);
	public layoutSetEval = SetRules.layoutSetEval(this);
	public layoutSetTrait = SetRules.layoutSetTrait(this);
	public layoutFor = ForRules.layoutFor(this);
	public layoutForTwoNumber = ForRules.layoutForTwoNumber(this);
	public layoutForItems = ForRules.layoutForItems(this);
	public layoutRepeat = RepeatRules.layoutRepeat(this);
	public layoutRepeatParms = RepeatRules.layoutRepeatParms(this);
	public layoutRepeatParm = RepeatRules.layoutRepeatParm(this);
	public layoutRepeatParmStep = RepeatRules.layoutRepeatParmStep(this);
	public layoutRepeatItems = RepeatRules.layoutRepeatItems(this);
	public layoutView = ViewRules.layoutView(this);
	public layoutViewType = ViewRules.layoutViewType(this);
	public layoutViewWidth = ViewRules.layoutViewWidth(this);
	public layoutViewHeight = ViewRules.layoutViewHeight(this);
	public layoutRect = RectRules.layoutRect(this);
	public layoutDefAnim = DefAnimRules.layoutDefAnim(this);
	public layoutDefAnimPath = DefAnimRules.layoutDefAnimPath(this);
	public layoutDefAnimSpeed = DefAnimRules.layoutDefAnimSpeed(this);
	public displayUI = UIRules.displayUI(this);
	public displayUIBackground = UIRules.displayUIBackground(this);
	public displayUIPos = UIRules.displayUIPos(this);
	public displayTimer = TimerRules.displayTimer(this);
	public displayOnEvent = OnRules.displayOnEvent(this);

	public gameSheet = GameRules.gameSheet(this);
	public gameClause = GameRules.gameClause(this);

	public levelSheet = LevelRules.levelSheet(this);
	public levelProps = LevelRules.levelProps(this);
	public levelSettings = LevelRules.levelSettings(this);
	public levelSprite = LevelRules.levelSprite(this);

	public editorSheet = EditorRules.editorSheet(this);
	public editorClause = EditorRules.editorClause(this);

	public debugSheet = DebugRules.debugSheet(this);
	public debugClause = DebugRules.debugClause(this);

	public font = MiscRules.font(this);
	public background = MiscRules.background(this);
	public showCursor = MiscRules.showCursor(this);
}
