import { EmbeddedActionsParser } from "chevrotain";
import { BackgroundLayerRules } from "./layers/background/background.rules";
import { DebugRules } from "./layers/debug/debug.rules";
import { DisplayRules } from "./layers/display/display.rules";
import { ActionRules } from "./layers/display/layout/action.rules";
import { DefAnimRules } from "./layers/display/layout/defanim.rules";
import { ForRules } from "./layers/display/layout/for.rules";
import { ImageRules } from "./layers/display/layout/image.rules";
import { LayoutRules } from "./layers/display/layout/layout.rules";
import { MenuRules } from "./layers/display/layout/menu.rules";
import { ParmsRules } from "./layers/display/layout/parms.rules";
import { RectRules } from "./layers/display/layout/rect.rules";
import { RepeatRules } from "./layers/display/layout/repeat.rules";
import { SetRules } from "./layers/display/layout/set.rules";
import { SpriteRules } from "./layers/display/layout/sprite.rules";
import { TextSpritePropsRules } from "./layers/display/layout/text-sprite-props.rules";
import { TextRules } from "./layers/display/layout/text.rules";
import { ViewRules } from "./layers/display/layout/view.rules";
import { MiscRules } from "./layers/display/misc.rules";
import { OnRules } from "./layers/display/on.rules";
import { SoundRules } from "./layers/display/sound.rules";
import { TimerRules } from "./layers/display/timer.rules";
import { UIRules } from "./layers/display/ui.rules";
import { EditorRules } from "./layers/editor/editor.rules";
import { GameRules } from "./layers/game/game.rules";
import { LevelRules } from "./layers/level/level.rules";
import { tokenList } from "./lexer";
import { SceneSheetRules } from "./scenes/scene.rules";
import { ExprRules } from "./shared/expr.rules";
import { TypesRules } from "./shared/types.rules";

export class SheetParser extends EmbeddedActionsParser {
	constructor() {
		super(tokenList);
		this.performSelfAnalysis();
	}

	public variablesDict = new Map<string, unknown>();

	public sceneSheet = SceneSheetRules.sceneSheet(this);
	public sceneSheetTypeAndName = SceneSheetRules.sceneSheetTypeAndName(this);
	public sceneProps = SceneSheetRules.sceneProps(this);
	public sceneShowCursor = SceneSheetRules.sceneShowCursor(this);

	public number = TypesRules.number(this);
	public variable = TypesRules.variable(this);
	public definedVariable = TypesRules.definedVariable(this);
	public htmlColor = TypesRules.htmlColor(this);
	public numOrVar = TypesRules.numOrVar(this);
	public tupleNumOrVar = TypesRules.tupleNumOrVar(this);
	public strOrVar = TypesRules.strOrVar(this);
	public varOrArrayOfVars = TypesRules.varOrArrayOfVars(this);
	public arrayOfVars = TypesRules.arrayOfVars(this);
	public arrayOfVarsAndStrings = TypesRules.arrayOfVarsAndStrings(this);

	public expr = ExprRules.expr(this);
	public exprAddition = ExprRules.exprAddition(this);
	public exprMultiplication = ExprRules.exprMultiplication(this);
	public exprScalar = ExprRules.exprScalar(this);
	public exprSubExpr = ExprRules.exprSubExpr(this);

	public displaySheet = DisplayRules.displaySheet(this);
	public displayProps = DisplayRules.displayProps(this);
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
	public layoutMenuKeys = MenuRules.layoutMenuKeys(this);
	public layoutMenuItems = MenuRules.layoutMenuItems(this);
	public layoutMenuItem = MenuRules.layoutMenuItemGroup(this);
	public layoutMenuSelection = MenuRules.layoutMenuSelection(this);
	public layoutMenuSelectionColor = MenuRules.layoutMenuSelectionColor(this);
	public layoutMenuSelectionSprite = MenuRules.layoutMenuSelectionSprite(this);
	public layoutMenuSelectionVar = MenuRules.layoutMenuSelectionVar(this);

	public layoutSet = SetRules.layoutSet(this);
	public layoutSetValue = SetRules.layoutSetValue(this);
	public layoutSetValueArray = SetRules.layoutSetValueArray(this);
	public layoutSetTrait = SetRules.layoutSetTrait(this);

	public layoutFor = ForRules.layoutFor(this);
	public layoutForTwoNumber = ForRules.layoutForTwoNumber(this);
	public layoutRepeat = RepeatRules.layoutRepeat(this);
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

	public levelSheet = LevelRules.levelSheet(this);
	public levelProps = LevelRules.levelProps(this);
	public levelSettings = LevelRules.levelSettings(this);
	public levelSprite = LevelRules.levelSprite(this);

	public editorSheet = EditorRules.editorSheet(this);
	public debugSheet = DebugRules.debugSheet(this);
	public backgroundLayerSheet = BackgroundLayerRules.backgroundLayerSheet(this);
	public backgroundColor = BackgroundLayerRules.backgroundColor(this);

	public font = MiscRules.font(this);
	public background = MiscRules.background(this);
}
