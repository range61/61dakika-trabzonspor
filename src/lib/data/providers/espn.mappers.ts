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
export function mapStandings(json:Any, slug="tur.1"):Standings{const child=json?.children?.[0],entries:Any[]=child?.standings?.entries??[],seasonName:string=child?.standings?.seasonDisplayName??json?.seasons?.[0]?.displayName??"",season=seasonName.match(/\d{4}[-/]\d{2,4}/)?.[0]?.replace("/","-")??seasonName;const rows:StandingRow[]=entries.map(e=>{const s:Record<string,number>={};for(const st of e.stats??[])s[st.name]=num(st.value??st.displayValue)??0;const zone=ZONE[(e.note?.description??"").toLowerCase()]??null,t=mapTeam(e.team);return{rank:s.rank||0,team:{id:t.id,name:t.name,shortName:t.shortName,logo:t.logo},played:s.gamesPlayed??0,won:s.wins??0,drawn:s.ties??0,lost:s.losses??0,goalsFor:s.pointsFor??0,goalsAgainst:s.pointsAgainst??0,goalDiff:s.pointDifferential??0,points:s.points??0,note:zone?ZONE_LABEL[zone]:null,zone}});rows.sort((a,b)=>a.rank-b.rank||b.points-a.points);return{competition:competitionFor(slug),season,rows}}
const POS:Record<string,PositionGroup>={goalkeeper:"GK",defender:"DEF",midfielder:"MID",forward:"FWD"};
const BEIN_PLAYER_PHOTOS: Record<string, string> = {
  "ahmet dogan yildirim": "https://cdn.trabzonspor.org.tr/trabzonspor_089423820ffc45adbcbce9a3c7e648b8.png",
  "ahmet yildirim": "https://cdn.trabzonspor.org.tr/trabzonspor_089423820ffc45adbcbce9a3c7e648b8.png",
  "andre onana": "https://cdn.trabzonspor.org.tr/trabzonspor_d7f0ef46eb424ac4abb012d156fb8ac5.png",
  "onuralp cevikkan": "https://cdn.trabzonspor.org.tr/trabzonspor_b45b0158c0d34952bc7be10aa8c9e2e6.png",
  "erol can colak": "https://cdn.trabzonspor.org.tr/trabzonspor_48cbfd5ebad24f489def17a9f9c99525.png",
  "samet akaydin": "https://cdn.trabzonspor.org.tr/trabzonspor_faf20f6ec65f4e498963129d58b7c70a.png",
  "stefan savic": "https://cdn.trabzonspor.org.tr/trabzonspor_5206a33953884aa4a57a37767dc01786.png",
  "mustafa eskihellac": "https://cdn.trabzonspor.org.tr/trabzonspor_50f6326d67bb40789daf51ee7ed41df2.png",
  "wagner pina": "https://cdn.trabzonspor.org.tr/trabzonspor_3a38ff667f004e96be035c6d2eac4abc.png",
  "chibuike nwaiwu": "https://cdn.trabzonspor.org.tr/trabzonspor_f773ed2c4bee4e489b9bce462fb8a20f.png",
  "chibuike godfrey nwaiwu": "https://cdn.trabzonspor.org.tr/trabzonspor_f773ed2c4bee4e489b9bce462fb8a20f.png",
  "cenk ozkacar": "https://cdn.trabzonspor.org.tr/trabzonspor_ff4300fd0f8241eab43a9276eba89485.png",
  "arseniy batagov": "https://cdn.trabzonspor.org.tr/trabzonspor_a361708b993f4b5d81835a51c0aad47c.png",
  "arsenii batahov": "https://cdn.trabzonspor.org.tr/trabzonspor_a361708b993f4b5d81835a51c0aad47c.png",
  "arseniy batahov": "https://cdn.trabzonspor.org.tr/trabzonspor_a361708b993f4b5d81835a51c0aad47c.png",
  "sidny lopes cabral": "https://cdn.trabzonspor.org.tr/trabzonspor_8b9ca588920c423eafa7cbf3cc64bf26.png",
  "batista mendy": "https://cdn.trabzonspor.org.tr/trabzonspor_474f419c7d6c4198a1e1466f17931314.png",
  "okay yokuslu": "https://cdn.trabzonspor.org.tr/trabzonspor_cc579106a2694f24ad261dfd29a60831.png",
  "fabinho": "https://cdn.trabzonspor.org.tr/trabzonspor_e359517fc9a041c098dbb209595348f8.png",
  "fabinho tavares": "https://cdn.trabzonspor.org.tr/trabzonspor_e359517fc9a041c098dbb209595348f8.png",
  "ernest muci": "https://cdn.trabzonspor.org.tr/trabzonspor_059c912a84e84534b6f65b6c7ae2c072.png",
  "benjamin bouchouari": "https://cdn.trabzonspor.org.tr/trabzonspor_7232c222bc1642129ef25b318c1b99ad.png",
  "ozan tufan": "https://cdn.trabzonspor.org.tr/trabzonspor_a4704d325217464481b501f66993dab9.png",
  "ruslan malinovskyi": "https://cdn.trabzonspor.org.tr/trabzonspor_1e26367b1703461893a9011ab54f0dc8.png",
  "tim jabol-folcarelli": "https://cdn.trabzonspor.org.tr/trabzonspor_bffed122dd99412fb0a3b6d5d8e757c3.png",
  "melih kabasakal": "https://cdn.trabzonspor.org.tr/trabzonspor_fc14d6b05fa8439ebc9fd367aff07acf.png",
  "aral simsir": "https://cdn.trabzonspor.org.tr/trabzonspor_2fd97df984764134ab152a269e663b80.png",
  "cihan canak": "https://cdn.trabzonspor.org.tr/trabzonspor_dc731a901714443188a6bac622e8e8aa.png",
  "noah saviolo": "https://cdn.trabzonspor.org.tr/trabzonspor_da9a6f64b4454cb7b11a46b0d875a996.png",
  "franculino dju": "https://cdn.trabzonspor.org.tr/trabzonspor_5e223e8896704bab8de831c4eb266e70.png",
  "mohamed salah": "https://cdn.trabzonspor.org.tr/trabzonspor_f53efa55f13344c29ad00d51ba724010.png",
  "umut nayir": "https://cdn.trabzonspor.org.tr/trabzonspor_d0ff3c69c9fa4ac2ac852a202e24fc43.png",
  "paul onuachu": "https://cdn.trabzonspor.org.tr/trabzonspor_980eaae4ac29476483e3d311216d8a58.png",
  "ebere paul onuachu": "https://cdn.trabzonspor.org.tr/trabzonspor_980eaae4ac29476483e3d311216d8a58.png",
  "metehan mimaroglu": "https://cdn.trabzonspor.org.tr/trabzonspor_b55af977b85541b6a20d2b833a1ec833.png",
  "ali habesoglu": "https://cdn.trabzonspor.org.tr/trabzonspor_d6adbc53eccf4b7d8e3dd6c3ea62d514.png"
};
function beinPlayerPhoto(a: Any): string | null {
  const name = String(a?.displayName ?? a?.fullName ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return BEIN_PLAYER_PHOTOS[name] ?? null;
}

export function mapAthlete(a:Any):Player{const s:Record<string,number>={};for(const cat of a?.statistics?.splits?.categories??[])for(const st of cat.stats??[])s[st.name]=num(st.value)??0;const stats:PlayerStats={appearances:s.appearances??0,subIns:s.subIns??0,goals:s.totalGoals??0,assists:s.goalAssists??0,shots:s.totalShots??0,shotsOnTarget:s.shotsOnTarget??0,yellowCards:s.yellowCards??0,redCards:s.redCards??0,foulsCommitted:s.foulsCommitted??0,foulsSuffered:s.foulsSuffered??0,offsides:s.offsides??0,saves:s.saves??0,goalsConceded:s.goalsConceded??0};const inches=num(a?.height),lbs=num(a?.weight);return{id:String(a.id),name:a.displayName??a.fullName??"—",jersey:a.jersey??null,position:POS[(a?.position?.name??"").toLowerCase()]??"MID",positionDetail:a?.position?.displayName??a?.position?.name??a?.position?.abbreviation??null,age:num(a.age),birthDate:a.dateOfBirth??null,nationality:a.citizenship??null,flag:a.flag?.href??null,heightCm:inches?Math.round(inches*2.54):null,weightKg:lbs?Math.round(lbs*.4536):null,photo:beinPlayerPhoto(a)??a?.headshot?.href??a?.headshots?.[0]?.href??a?.links?.find((l:Any)=>l.rel?.includes("headshot"))?.href??(a?.id?`https://a.espncdn.com/i/headshots/soccer/players/full/${a.id}.png`:null),profileUrl:a.links?.find((l:Any)=>l.rel?.includes("playercard"))?.href??null,stats}}
