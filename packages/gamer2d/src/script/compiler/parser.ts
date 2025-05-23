import { EmbeddedActionsParser } from "chevrotain";
import { BackgroundLayerRules } from "./layers/background/background.rules";
import { DebugRules } from "./layers/debug/debug.rules";
import { DisplayRules } from "./layers/display/display.rules";
import { DefAnimRules } from "./layers/display/layout/defanim.rules";
import { ForRules } from "./layers/display/layout/for.rules";
import { ImageRules } from "./layers/display/layout/image.rules";
import { LayoutRules } from "./layers/display/layout/layout.rules";
import { MenuRules } from "./layers/display/layout/menu.rules";
import { EntityPoolRules } from "./layers/display/layout/pool.rules";
import { RectRules } from "./layers/display/layout/rect.rules";
import { RepeatRules } from "./layers/display/layout/repeat.rules";
import { SetRules } from "./layers/display/layout/set.rules";
import { SpriteRules } from "./layers/display/layout/sprite.rules";
import { TextSpritePropsRules } from "./layers/display/layout/text-sprite-props.rules";
import { TextRules } from "./layers/display/layout/text.rules";
import { ViewRules } from "./layers/display/layout/view.rules";
import { OnRules } from "./layers/display/on.rules";
import { SoundRules } from "./layers/display/sound.rules";
import { TimerRules } from "./layers/display/timer.rules";
import { UIRules } from "./layers/display/ui.rules";
import { EditorRules } from "./layers/editor/editor.rules";
import { EntitiesLayerRules } from "./layers/entities/entities.rules";
import { GameRules } from "./layers/game/game.rules";
import { GlobalsLayerRules } from "./layers/globals/globals.rules";
import { LayerSheetRules } from "./layers/layer.rules";
import { LevelRules } from "./layers/level/level.rules";
import { UserDefinedLayerRules } from "./layers/user_defined/user_defined.rules";
import { tokenList } from "./lexer";
import { SpriteSheetRules } from "./ressources/spritesheet.rules";
import { SceneSheetRules } from "./scenes/scene.rules";
import { ActionRules } from "./shared/action.rules";
import { ExprRules } from "./shared/expr.rules";
import { MiscRules } from "./shared/misc.rules";
import { ParmsRules } from "./shared/parms.rules";
import { SettingsRules } from "./shared/settings.rules";
import { TypesRules } from "./shared/types.rules";

export class SheetParser extends EmbeddedActionsParser {
	constructor() {
		super(tokenList);
		this.performSelfAnalysis();
	}

	public variablesDict = new Map<string, unknown>();

	public spriteSheet = SpriteSheetRules.spriteSheet(this);
	public spriteSheetTypeAndName = SpriteSheetRules.spriteSheetTypeAndName(this);
	public spriteSheetSprites = SpriteSheetRules.spriteSheetSprites(this);
	public spriteSheetSprite = SpriteSheetRules.spriteSheetSprite(this);
	public spriteSheetSpriteName = SpriteSheetRules.spriteSheetSpriteName(this);
	public spriteSheetAnims = SpriteSheetRules.spriteSheetAnims(this);
	public spriteSheetAnim = SpriteSheetRules.spriteSheetAnim(this);
	public spriteSheetGrid = SpriteSheetRules.spriteSheetGrid(this);
	public spriteSheetSpriteRects = SpriteSheetRules.spriteSheetSpriteRects(this);
	public spriteSheetSpriteRect = SpriteSheetRules.spriteSheetSpriteRect(this);
	public spriteSheetSpriteTiles = SpriteSheetRules.spriteSheetSpriteTiles(this);
	public spriteSheetFor = SpriteSheetRules.spriteSheetFor(this);

	public sceneSheet = SceneSheetRules.sceneSheet(this);
	public sceneSheetTypeAndName = SceneSheetRules.sceneSheetTypeAndName(this);
	public sceneProps = SceneSheetRules.sceneProps(this);
	public sceneShowCursor = SceneSheetRules.sceneShowCursor(this);
	public sceneDebug = SceneSheetRules.sceneDebug(this);

	public layerSheet = LayerSheetRules.layerSheet(this);

	public number = TypesRules.number(this);
	// public variable = TypesRules.variable(this);
	public definedVariable = TypesRules.definedVariable(this);
	public htmlColor = TypesRules.htmlColor(this);
	public numOrVar = TypesRules.numOrVar(this);
	public tupleExpr = TypesRules.tupleExpr(this);
	public rectExpr = TypesRules.rectExpr(this);
	public strOrVar = TypesRules.strOrVar(this);
	public varOrArrayOfVars = TypesRules.varOrArrayOfVars(this);
	public arrayOfVars = TypesRules.arrayOfVars(this);
	public arrayOfVarsStringsNumbers = TypesRules.arrayOfVarsStringsNumbers(this);

	public expr = ExprRules.expr(this);
	public exprAddition = ExprRules.exprAddition(this);
	public exprMultiplication = ExprRules.exprMultiplication(this);
	public exprScalar = ExprRules.exprScalar(this);
	public exprSubExpr = ExprRules.exprSubExpr(this);

	public settingsBlock = SettingsRules.settingsBlock(this);
	public settingsStatements = SettingsRules.settingsStatements(this);

	public displayLayerSheet = DisplayRules.displayLayerSheet(this);
	public displayProps = DisplayRules.displayProps(this);
	public displaySettings = DisplayRules.displaySettings(this);
	public displaySet = DisplayRules.displaySet(this);

	public sound = SoundRules.sound(this);

	public parm_at = ParmsRules.parm_at(this);
	public parm_range = ParmsRules.parm_range(this);
	public parm_dir = ParmsRules.parm_dir(this);
	public parm_traits = ParmsRules.parm_traits(this);
	public parm_width = ParmsRules.parm_width(this);
	public parm_height = ParmsRules.parm_height(this);
	public parm_count = ParmsRules.parm_count(this);

	public layout = LayoutRules.layout(this);
	public layoutStatement = LayoutRules.layoutStatement(this);
	public layoutText = TextRules.layoutText(this);
	public layoutAction = ActionRules.layoutAction(this);
	public layoutSprite = SpriteRules.layoutSprite(this);
	public layoutImage = ImageRules.layoutImage(this);
	public textSpriteProps = TextSpritePropsRules.textSpriteProps(this);

	public actionBlock = ActionRules.actionBlock(this);
	public actionStatement = ActionRules.actionStatement(this);
	public actionFunctionCallList = ActionRules.actionFunctionCallList(this);
	public actionFunctionCall = ActionRules.actionFunctionCall(this);
	public actionFunctionName = ActionRules.actionFunctionName(this);

	public layoutPool = EntityPoolRules.layoutPool(this);

	public layoutMenu = MenuRules.layoutMenu(this);
	public layoutMenuKeys = MenuRules.layoutMenuKeys(this);
	public layoutMenuItems = MenuRules.layoutMenuItems(this);
	public layoutMenuItem = MenuRules.layoutMenuItemGroup(this);
	public layoutMenuSelection = MenuRules.layoutMenuSelection(this);
	public layoutMenuSelectionBackground = MenuRules.layoutMenuSelectionBackground(this);
	public layoutMenuSelectionColor = MenuRules.layoutMenuSelectionColor(this);
	public layoutMenuSelectionSprite = MenuRules.layoutMenuSelectionSprite(this);
	public layoutMenuSelectionVar = MenuRules.layoutMenuSelectionVar(this);

	public layoutSet = SetRules.layoutSet(this);
	public layoutSetValue = SetRules.layoutSetValue(this);
	public layoutSetValueArray = SetRules.layoutSetValueArray(this);
	public layoutSetTrait = SetRules.layoutSetTrait(this);

	public layoutFor = ForRules.layoutFor(this);
	public layoutForClause = ForRules.layoutForClause(this);

	public layoutRepeat = RepeatRules.layoutRepeat(this);
	public layoutRepeatItems = RepeatRules.layoutRepeatItems(this);

	public layoutView = ViewRules.layoutView(this);
	public layoutRect = RectRules.layoutRect(this);

	public layoutDefAnim = DefAnimRules.layoutDefAnim(this);
	public layoutDefAnimPath = DefAnimRules.layoutDefAnimPath(this);
	public layoutDefAnimSpeed = DefAnimRules.layoutDefAnimSpeed(this);

	public displayUI = UIRules.displayUI(this);
	public displayUIBackground = UIRules.displayUIBackground(this);
	public displayUIPos = UIRules.displayUIPos(this);
	public displayTimer = TimerRules.displayTimer(this);
	public displayOnEvent = OnRules.displayOnEvent(this);

	public gameLayerSheet = GameRules.gameLayerSheet(this);

	public levelLayerSheet = LevelRules.levelLayerSheet(this);
	public levelProps = LevelRules.levelProps(this);

	public editorSheet = EditorRules.editorSheet(this);
	public debugSheet = DebugRules.debugSheet(this);
	public backgroundLayerSheet = BackgroundLayerRules.backgroundLayerSheet(this);
	public backgroundColor = BackgroundLayerRules.backgroundColor(this);

	public userDefinedLayerSheet = UserDefinedLayerRules.userDefinedLayerSheet(this);
	public globalsLayerSheet = GlobalsLayerRules.globalsLayerSheet(this);

	public entitiesLayerSheet = EntitiesLayerRules.entitiesLayerSheet(this);
	public entitiesLayerSprite = EntitiesLayerRules.entitiesLayerSprite(this);

	public font = MiscRules.font(this);
}
