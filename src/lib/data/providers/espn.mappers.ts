/* Pure mappers from ESPN's public (unofficial) JSON into app models. No network here. */
import { CLUB, TEAM_NAMES_TR, competitionFor } from "../config";
import type { Competition,Lineup,Match,MatchDetail,MatchEvent,MatchSide,MatchStat,MatchState,Player,PlayerStats,PositionGroup,StandingRow,Standings } from "../types";
/* eslint-disable @typescript-eslint/no-explicit-any */
type Any=any;
const num=(v:unknown):number|null=>{if(v==null||v==="")return null;if(typeof v==="object"&&v&&"value" in (v as Any))return num((v as Any).value);const n=Number(typeof v==="object"&&v&&"displayValue" in (v as Any)?(v as Any).displayValue:v);return Number.isFinite(n)?n:null};
export function mapTeam(t:Any,score:unknown=null):MatchSide{const id=String(t?.id??"");const tr=TEAM_NAMES_TR[id];return{id,name:tr?.name??t?.displayName??t?.name??"Bilinmiyor",shortName:tr?.short??t?.abbreviation??(t?.displayName??"").slice(0,3).toUpperCase(),logo:t?.logos?.[0]?.href??t?.logo??null,score:num(score)}}
export function mapState(status:Any):{state:MatchState;text:string;clock:string|null}{const name:string=status?.type?.name??"";const st:string=status?.type?.state??"pre";if(name.includes("POSTPONED"))return{state:"postponed",text:"Ertelendi",clock:null};if(name.includes("CANCEL")||name.includes("ABANDON"))return{state:"canceled",text:"İptal",clock:null};if(st==="in"){const ht=name.includes("HALFTIME");return{state:"in",text:ht?"Devre arası":"Canlı",clock:ht?"İY":status?.displayClock??null}}if(st==="post")return{state:"post",text:name.includes("PEN")?"Pen.":name.includes("AET")||name.includes("EXTRA")?"UZ":"MS",clock:null};return{state:"pre",text:"Başlamadı",clock:null}}
function outcomeFor(home:MatchSide,away:MatchSide,isHome:boolean,state:MatchState){if(state!=="post"||home.score==null||away.score==null)return null;const us=isHome?home.score:away.score,them=isHome?away.score:home.score;return us>them?"G":us<them?"M":"B"}
export function mapEvent(ev:Any,fallbackComp?:Competition):Match|null{const comp=ev?.competitions?.[0]??ev;const competitors:Any[]=comp?.competitors??[];const h=competitors.find(c=>c.homeAway==="home"),a=competitors.find(c=>c.homeAway==="away");if(!h||!a)return null;const home=mapTeam(h.team,h.score),away=mapTeam(a.team,a.score);const {state,text,clock}=mapState(comp?.status??ev?.status);if(state==="pre"){home.score=null;away.score=null}const isHome=home.id===CLUB.espnId;const competition=ev?.league?.slug?competitionFor(ev.league.slug):(fallbackComp??competitionFor(ev?.league?.name));return{id:String(ev.id),competition,date:comp?.date??ev?.date,state,statusText:text,clock,venue:comp?.venue?.fullName??null,home,away,isHome,outcome:outcomeFor(home,away,isHome,state)}}
const STAT_DEFS=[{key:"possessionPct",label:"Topa sahip olma",unit:"%"},{key:"totalShots",label:"Şut"},{key:"shotsOnTarget",label:"İsabetli şut"},{key:"wonCorners",label:"Korner"},{key:"totalPasses",label:"Pas"},{key:"accuratePasses",label:"İsabetli pas"},{key:"foulsCommitted",label:"Faul"},{key:"offsides",label:"Ofsayt"},{key:"saves",label:"Kurtarış"},{key:"yellowCards",label:"Sarı kart"},{key:"redCards",label:"Kırmızı kart"}];
function eventType(text:string):MatchEvent["type"]|null{const t=text.toLowerCase();if(t.includes("own goal"))return"own-goal";if(t.includes("penalty - scored"))return"penalty";if(t==="goal"||t.startsWith("goal"))return"goal";if(t.includes("red card"))return"red";if(t.includes("yellow card"))return"yellow";if(t.includes("substitution"))return"sub";return null}
function mapLineup(r:Any):Lineup|null{if(!r?.roster?.length)return null;return{formation:r.formation??null,players:r.roster.map((p:Any)=>({name:p.athlete?.displayName??"—",jersey:p.jersey??null,position:p.position?.abbreviation??null,starter:!!p.starter}))}}
export function mapSummary(json:Any):MatchDetail|null{const header=json?.header,c=header?.competitions?.[0];if(!c)return null;const base=mapEvent({id:header.id,competitions:[{...c,venue:json?.gameInfo?.venue??c.venue}],league:header.league},competitionFor(header?.league?.slug??header?.league?.name));if(!base)return null;const homeId=base.home.id;const events:MatchEvent[]=(json?.keyEvents??[]).map((e:Any):MatchEvent|null=>{const type=eventType(e?.type?.text??"");if(!type)return null;return{minute:e?.clock?.displayValue??"",type,side:String(e?.team?.id)===homeId?"home":"away",players:(e?.participants??[]).map((p:Any)=>p?.athlete?.displayName).filter(Boolean)}}).filter(Boolean) as MatchEvent[];const teams:Any[]=json?.boxscore?.teams??[];const statsOf=(id:string)=>{const t=teams.find(x=>String(x?.team?.id)===id),m:Record<string,number>={};for(const s of t?.statistics??[]){const v=num(s.displayValue);if(v!=null)m[s.name]=v}return m};const hs=statsOf(homeId),as=statsOf(base.away.id);const stats:MatchStat[]=STAT_DEFS.filter(d=>d.key in hs||d.key in as).map(d=>({key:d.key,label:d.label,unit:d.unit,home:hs[d.key]??0,away:as[d.key]??0}));const rosters:Any[]=json?.rosters??[];const rosterOf=(id:string,side:string)=>rosters.find(r=>String(r?.team?.id)===id)??rosters.find(r=>r?.homeAway===side);return{...base,events,stats,lineups:{home:mapLineup(rosterOf(homeId,"home")),away:mapLineup(rosterOf(base.away.id,"away"))}}}
const ZONE:Record<string,StandingRow["zone"]>={"champions league":"cl","champions league qualifying":"clq","europa league qualifying":"el","europa league":"el","conference league qualifying":"ecl","conference league":"ecl",relegated:"rel",relegation:"rel"};
const ZONE_LABEL:Record<NonNullable<StandingRow["zone"]>,string>={cl:"Şampiyonlar Ligi",clq:"Şampiyonlar Ligi elemesi",el:"Avrupa Ligi elemesi",ecl:"Konferans Ligi elemesi",rel:"Küme düşme"};
export function mapStandings(json:Any):Standings{const child=json?.children?.[0],entries:Any[]=child?.standings?.entries??[],seasonName:string=child?.standings?.seasonDisplayName??json?.seasons?.[0]?.displayName??"",season=seasonName.match(/\d{4}[-/]\d{2,4}/)?.[0]?.replace("/","-")??seasonName;const rows:StandingRow[]=entries.map(e=>{const s:Record<string,number>={};for(const st of e.stats??[])s[st.name]=num(st.value??st.displayValue)??0;const zone=ZONE[(e.note?.description??"").toLowerCase()]??null,t=mapTeam(e.team);return{rank:s.rank||0,team:{id:t.id,name:t.name,shortName:t.shortName,logo:t.logo},played:s.gamesPlayed??0,won:s.wins??0,drawn:s.ties??0,lost:s.losses??0,goalsFor:s.pointsFor??0,goalsAgainst:s.pointsAgainst??0,goalDiff:s.pointDifferential??0,points:s.points??0,note:zone?ZONE_LABEL[zone]:null,zone}});rows.sort((a,b)=>a.rank-b.rank||b.points-a.points);return{competition:competitionFor("tur.1"),season,rows}}
const POS:Record<string,PositionGroup>={goalkeeper:"GK",defender:"DEF",midfielder:"MID",forward:"FWD"};
const BEIN_PLAYER_PHOTOS: Record<string, string> = {
  "andre onana": "https://media02.tr.beinsports.com/img/players/P2946.png",
  "onuralp cevikkan": "https://media02.tr.beinsports.com/img/players/P108842.png",
  "ahmet yildirim": "https://media02.tr.beinsports.com/img/players/P124833.png",
  "stefan savic": "https://media02.tr.beinsports.com/img/players/P13601.png",
  "mustafa eskihellac": "https://media02.tr.beinsports.com/img/players/P5693.png",
  "wagner pina": "https://media02.tr.beinsports.com/img/players/P109378.png",
  "samet akaydin": "https://media02.tr.beinsports.com/img/players/P66219.png",
  "cenk ozkacar": "https://media02.tr.beinsports.com/img/players/P60976.png",
  "okay yokuslu": "https://media02.tr.beinsports.com/img/players/P4152.png",
  "john david lundstram": "https://media02.tr.beinsports.com/img/players/P13644.png",
  "melih kabasakal": "https://media02.tr.beinsports.com/img/players/P66126.png",
  "batista mendy": "https://media02.tr.beinsports.com/img/players/P62573.png",
  "benjamin bouchouari": "https://media02.tr.beinsports.com/img/players/P67160.png",
  "ozan tufan": "https://media02.tr.beinsports.com/img/players/P24815.png",
  "ruslan malinovskyi": "https://media02.tr.beinsports.com/img/players/P1437.jpg",
  "ernest muci": "https://media02.tr.beinsports.com/img/players/P68068.png",
  "tim jabol-folcarelli": "https://media02.tr.beinsports.com/img/players/P109957.png",
  "arseniy batagov": "https://media02.tr.beinsports.com/img/players/P52229.png",
  "mete han mimaroglu": "https://media02.tr.beinsports.com/img/players/P60999.png",
  "metehan mimaroglu": "https://media02.tr.beinsports.com/img/players/P60999.png",
  "umut nayir": "https://media02.tr.beinsports.com/img/players/P5441.png",
  "paul onuachu": "https://media02.tr.beinsports.com/img/players/P31933.png",
  "ebere paul onuachu": "https://media02.tr.beinsports.com/img/players/P31933.png",
  "cihan canak": "https://media02.tr.beinsports.com/img/players/P81490.png",
};

function beinPlayerPhoto(a: Any): string | null {
  const name = String(a?.displayName ?? a?.fullName ?? "")
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/\\s+/g, " ")
    .trim();
  return BEIN_PLAYER_PHOTOS[name] ?? null;
}

export function mapAthlete(a:Any):Player{const s:Record<string,number>={};for(const cat of a?.statistics?.splits?.categories??[])for(const st of cat.stats??[])s[st.name]=num(st.value)??0;const stats:PlayerStats={appearances:s.appearances??0,subIns:s.subIns??0,goals:s.totalGoals??0,assists:s.goalAssists??0,shots:s.totalShots??0,shotsOnTarget:s.shotsOnTarget??0,yellowCards:s.yellowCards??0,redCards:s.redCards??0,foulsCommitted:s.foulsCommitted??0,foulsSuffered:s.foulsSuffered??0,offsides:s.offsides??0,saves:s.saves??0,goalsConceded:s.goalsConceded??0};const inches=num(a?.height),lbs=num(a?.weight);return{id:String(a.id),name:a.displayName??a.fullName??"—",jersey:a.jersey??null,position:POS[(a?.position?.name??"").toLowerCase()]??"MID",positionDetail:a?.position?.displayName??a?.position?.name??a?.position?.abbreviation??null,age:num(a.age),birthDate:a.dateOfBirth??null,nationality:a.citizenship??null,flag:a.flag?.href??null,heightCm:inches?Math.round(inches*2.54):null,weightKg:lbs?Math.round(lbs*.4536):null,photo:beinPlayerPhoto(a)??a?.headshot?.href??a?.headshots?.[0]?.href??a?.links?.find((l:Any)=>l.rel?.includes("headshot"))?.href??(a?.id?`https://a.espncdn.com/i/headshots/soccer/players/full/${a.id}.png`:null),profileUrl:a.links?.find((l:Any)=>l.rel?.includes("playercard"))?.href??null,stats}}
