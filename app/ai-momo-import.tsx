import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { saveTransaction } from '@/lib/db';
import React, { useEffect, useState } from 'react';
import {
  Alert, Platform, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY        = '#1D9E75';
const GOLD           = '#F5A623';
const BG             = '#F0F4F3';
const CARD_BG        = '#FFFFFF';
const TEXT_PRIMARY   = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

type ParsedTx = {
  id: string; name: string; time: string; amount: number;
  category: string; categoryLabel: string; icon: string;
  iconBg: string; iconColor: string; smsText: string;
  type: 'income' | 'expense'; paymentType: 'MoMo';
  network: 'MTN' | 'Vodafone' | 'AirtelTigo';
};

const CATEGORIES = [
  'Food & Dining','Transfer','Mobile & Internet',
  'Bills','Transport','Shopping','Health','Salary','Other',
];

const CATEGORY_MAP: Record<string,string> = {
  'Food & Dining':'food','Transfer':'other','Mobile & Internet':'airtime',
  'Bills':'bills','Transport':'transport','Shopping':'shopping',
  'Health':'health','Salary':'salary','Other':'other',
};

// ── Regex helpers ──────────────────────────────────────
const AMOUNT_RE = /(?:GHS|GHC|GH[SC]?)\s*([\d,]+\.?\d*)/i;

function detectNetwork(addr: string, body: string): 'MTN'|'Vodafone'|'AirtelTigo' {
  const s = (addr+body).toLowerCase();
  if (s.includes('vodafone')||s.includes('telecel')||s.includes('vcash')) return 'Vodafone';
  if (s.includes('airteltigo')||s.includes('airtel')||s.includes('tigo'))  return 'AirtelTigo';
  return 'MTN';
}

function guessCategory(body: string, name: string): {label:string;id:string} {
  const t = (body+name).toLowerCase();
  if (/airtime|data bundle|internet/.test(t))          return {label:'Mobile & Internet',id:'airtime'};
  if (/ecg|water|electricity|utility|bill/.test(t))    return {label:'Bills',id:'bills'};
  if (/uber|bolt|taxi|transport|fuel/.test(t))          return {label:'Transport',id:'transport'};
  if (/salary|payroll|wage/.test(t))                    return {label:'Salary',id:'salary'};
  if (/pharmacy|hospital|clinic|health/.test(t))        return {label:'Health',id:'health'};
  if (/shoprite|melcom|shop|market/.test(t))            return {label:'Shopping',id:'shopping'};
  if (/kfc|pizza|food|restaurant|cafe/.test(t))         return {label:'Food & Dining',id:'food'};
  return {label:'Transfer',id:'other'};
}

function fmtDate(ts: number): string {
  const d=new Date(ts), now=new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const txDay=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const diff=today.getTime()-txDay.getTime();
  const time=d.toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'});
  if(diff===0)        return `Today, ${time}`;
  if(diff===86400000) return `Yesterday, ${time}`;
  return d.toLocaleDateString('en-GH',{day:'numeric',month:'short'})+`, ${time}`;
}

function parseSMS(body:string,addr:string,date:number,id:string): ParsedTx|null {
  if(!/GH[SC]|momo|transfer|sent|received|payment|airtime/i.test(body)) return null;
  const am=body.match(AMOUNT_RE);
  if(!am) return null;
  const amount=parseFloat(am[1].replace(/,/g,''));
  if(!amount||amount<=0) return null;

  let name='MoMo Transaction', type:'income'|'expense'='expense';

  // Received
  if(/received|credited|deposited/i.test(body)) {
    type='income';
    const m=body.match(/from\s+([A-Za-z][A-Za-z\s]{2,25})/i);
    name=m?m[1].trim().split(/\s+/).slice(0,3).join(' '):addr;
  }
  // Sent / Payment
  else if(/sent|paid|payment|transfer.*to/i.test(body)) {
    type='expense';
    const m=body.match(/(?:to|payment to)\s+([A-Za-z][A-Za-z\s]{2,25})/i);
    name=m?m[1].trim().split(/\s+/).slice(0,3).join(' '):'Payment';
  }
  // Airtime
  else if(/airtime|data bundle/i.test(body)) {
    type='expense';
    name=detectNetwork(addr,body)+' Airtime';
  }

  const cat=guessCategory(body,name);
  const network=detectNetwork(addr,body);

  return {
    id, name, time:fmtDate(date),
    amount: type==='income'?amount:-amount,
    category:cat.id, categoryLabel:cat.label,
    icon: type==='income'?'arrow-down-circle':'arrow-up-circle',
    iconBg: type==='income'?'#E1F5EE':'#FEF2F2',
    iconColor: type==='income'?PRIMARY:'#E24B4A',
    smsText:body.trim(), type, paymentType:'MoMo', network,
  };
}

async function readAndParseSMS(): Promise<ParsedTx[]> {
  if(Platform.OS!=='android') return [];
  try {
    const {NativeModules}=require('react-native');
    if(!NativeModules.SmsAndroid) return [];
    const msgs:{body:string;date:number;address:string}[] = await new Promise(resolve=>{
      NativeModules.SmsAndroid.list(
        JSON.stringify({box:'inbox',maxCount:200}),
        ()=>resolve([]),
        (_:number,list:string)=>{
          try { resolve(JSON.parse(list).map((m:any)=>({body:m.body||'',date:parseInt(m.date)||Date.now(),address:m.address||''}))); }
          catch { resolve([]); }
        }
      );
    });
    const results:ParsedTx[]=[];
    const seen=new Set<string>();
    msgs.forEach((m,i)=>{
      const p=parseSMS(m.body,m.address,m.date,String(i+1));
      if(!p) return;
      const key=`${p.name}-${Math.abs(p.amount)}-${p.time.split(',')[0]}`;
      if(!seen.has(key)){ seen.add(key); results.push(p); }
    });
    return results;
  } catch { return []; }
}

const DEMO:ParsedTx[]=[
  {id:'1',name:'KFC Osu',time:'Today, 1:30 PM',amount:-125.50,category:'food',categoryLabel:'Food & Dining',icon:'arrow-up-circle',iconBg:'#FEF2F2',iconColor:'#E24B4A',smsText:'Payment of GHS 125.50 to KFC Osu. Balance: GHS 4,250.00.',type:'expense',paymentType:'MoMo',network:'MTN'},
  {id:'2',name:'Ama Serwaa',time:'Yesterday, 4:15 PM',amount:300,category:'other',categoryLabel:'Transfer',icon:'arrow-down-circle',iconBg:'#E1F5EE',iconColor:PRIMARY,smsText:'You have received GHS 300.00 from Ama Serwaa. Balance: GHS 4,375.50.',type:'income',paymentType:'MoMo',network:'MTN'},
  {id:'3',name:'MTN Airtime',time:'Yesterday, 9:00 AM',amount:-50,category:'airtime',categoryLabel:'Mobile & Internet',icon:'arrow-up-circle',iconBg:'#FEF2F2',iconColor:'#E24B4A',smsText:'Airtime purchase of GHS 50.00 successful. Balance: GHS 4,075.50.',type:'expense',paymentType:'MoMo',network:'MTN'},
];

function TxCard({tx,selected,onToggle,onCategoryChange}:{tx:ParsedTx;selected:boolean;onToggle:()=>void;onCategoryChange:(c:string)=>void}) {
  const [show,setShow]=useState(false);
  const inc=tx.amount>=0;
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={[s.txIcon,{backgroundColor:tx.iconBg}]}>
          <Ionicons name={tx.icon as any} size={22} color={tx.iconColor}/>
        </View>
        <View style={s.txMeta}>
          <Text style={s.txName}>{tx.name}</Text>
          <Text style={s.txTime}>{tx.time}</Text>
        </View>
        <TouchableOpacity style={[s.checkbox,selected&&s.checkOn]} onPress={onToggle}>
          {selected&&<Ionicons name="checkmark" size={14} color="#fff"/>}
        </TouchableOpacity>
      </View>
      <View style={s.divider}/>
      <View style={s.cardMid}>
        <Text style={[s.amount,{color:inc?PRIMARY:TEXT_PRIMARY}]}>
          {inc?'+':'-'}₵ {Math.abs(tx.amount).toLocaleString('en-GH',{minimumFractionDigits:2})}
        </Text>
        <TouchableOpacity style={s.pill} onPress={()=>setShow(!show)}>
          <Text style={s.pillText}>{tx.categoryLabel}</Text>
          <Ionicons name="chevron-down" size={13} color="#92400E"/>
        </TouchableOpacity>
      </View>
      {show&&(
        <View style={s.dropdown}>
          {CATEGORIES.map(c=>(
            <TouchableOpacity key={c} style={[s.dropItem,c===tx.categoryLabel&&s.dropActive]}
              onPress={()=>{onCategoryChange(c);setShow(false);}}>
              <Text style={[s.dropText,c===tx.categoryLabel&&s.dropTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={s.smsBox}>
        <View style={s.smsLine}/>
        <Text style={s.smsText} numberOfLines={2}>{tx.smsText}</Text>
      </View>
    </View>
  );
}

export default function MoMoImportScreen() {
  const [txs,setTxs]=useState<ParsedTx[]>([]);
  const [sel,setSel]=useState<Set<string>>(new Set());
  const [cats,setCats]=useState<Record<string,string>>({});
  const [scanning,setScanning]=useState(true);
  const [importing,setImporting]=useState(false);
  const [isDemo,setIsDemo]=useState(false);

  useEffect(()=>{scan();},[]);

  const scan=async()=>{
    setScanning(true);
    try {
      let p=Platform.OS==='android'?await readAndParseSMS():[];
      if(p.length===0){p=DEMO;setIsDemo(true);}else{setIsDemo(false);}
      setTxs(p);
      setSel(new Set(p.map(t=>t.id)));
      setCats(Object.fromEntries(p.map(t=>[t.id,t.categoryLabel])));
    } catch {
      setTxs(DEMO);setSel(new Set(DEMO.map(t=>t.id)));
      setCats(Object.fromEntries(DEMO.map(t=>[t.id,t.categoryLabel])));
      setIsDemo(true);
    } finally {setScanning(false);}
  };

  const handleImport=async()=>{
    if(sel.size===0){Alert.alert('Nothing selected','Tap a transaction to select it.');return;}
    setImporting(true);
    try {
      await Promise.all(txs.filter(t=>sel.has(t.id)).map(tx=>saveTransaction({
        name:tx.name,amount:Math.abs(tx.amount),type:tx.type,
        paymentType:tx.paymentType,network:tx.network,
        category:CATEGORY_MAP[cats[tx.id]]||tx.category,note:tx.smsText,
      })));
      Alert.alert('✅ Saved!',`${sel.size} transaction${sel.size>1?'s':''} recorded.`,
        [{text:'OK',onPress:()=>router.back()}]);
    } catch(e:any){Alert.alert('Error',e.message);}
    finally{setImporting(false);}
  };

  if(scanning) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG}/>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>router.back()}>
          <Ionicons name="chevron-back" size={20} color={TEXT_PRIMARY}/>
        </TouchableOpacity>
        <Text style={s.headerTitle}>MoMo Import</Text>
        <View style={{width:60}}/>
      </View>
      <View style={s.scanBox}>
        <ActivityIndicator size="large" color={PRIMARY}/>
        <Text style={s.scanTitle}>Reading SMS inbox...</Text>
        <Text style={s.scanSub}>No AI needed — fast regex parsing</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG}/>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>router.back()}>
          <Ionicons name="chevron-back" size={20} color={TEXT_PRIMARY}/>
        </TouchableOpacity>
        <Text style={s.headerTitle}>MoMo Import</Text>
        <TouchableOpacity onPress={()=>setSel(sel.size===txs.length?new Set():new Set(txs.map(t=>t.id)))}>
          <Text style={s.selectAll}>{sel.size===txs.length?'Deselect All':'Select All'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.banner}>
          <View style={s.bannerIcon}><Text style={{fontSize:20}}>📱</Text></View>
          <View style={{flex:1}}>
            <Text style={s.bannerTitle}>{txs.length} transaction{txs.length!==1?'s':''} found</Text>
            <Text style={s.bannerSub}>{isDemo
              ?Platform.OS==='ios'?'iOS doesn\'t allow SMS access. Showing demo data.':'Enable READ_SMS in your Android build for real data.'
              :'Parsed from SMS inbox. 100% free & offline.'}</Text>
          </View>
        </View>

        {Platform.OS==='android'&&(
          <TouchableOpacity style={s.rescanBtn} onPress={scan} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color={PRIMARY}/>
            <Text style={s.rescanText}>Rescan</Text>
          </TouchableOpacity>
        )}

        {txs.map(tx=>(
          <TxCard key={tx.id}
            tx={{...tx,categoryLabel:cats[tx.id]||tx.categoryLabel}}
            selected={sel.has(tx.id)}
            onToggle={()=>{const n=new Set(sel);n.has(tx.id)?n.delete(tx.id):n.add(tx.id);setSel(n);}}
            onCategoryChange={c=>setCats(p=>({...p,[tx.id]:c}))}
          />
        ))}
        <View style={{height:100}}/>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.importBtn,(sel.size===0||importing)&&s.importOff]}
          onPress={handleImport} disabled={sel.size===0||importing} activeOpacity={0.85}>
          {importing?<ActivityIndicator color="#fff"/>
            :<Text style={s.importText}>Save {sel.size>0?sel.size:''} Transaction{sel.size!==1?'s':''}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:BG},
  scroll:{paddingHorizontal:16,paddingTop:8},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14},
  backBtn:{width:38,height:38,borderRadius:19,backgroundColor:CARD_BG,alignItems:'center',justifyContent:'center',borderWidth:0.5,borderColor:'#E5E7EB'},
  headerTitle:{fontSize:18,fontWeight:'800',color:TEXT_PRIMARY},
  selectAll:{fontSize:15,fontWeight:'600',color:PRIMARY},
  scanBox:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:32},
  scanTitle:{fontSize:18,fontWeight:'700',color:TEXT_PRIMARY,marginTop:20,marginBottom:8},
  scanSub:{fontSize:14,color:TEXT_SECONDARY,textAlign:'center'},
  banner:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#FFF8EC',borderRadius:16,padding:16,marginBottom:12,borderWidth:1,borderColor:'#FFE4A0'},
  bannerIcon:{width:44,height:44,borderRadius:12,backgroundColor:GOLD,alignItems:'center',justifyContent:'center'},
  bannerTitle:{fontSize:15,fontWeight:'700',color:TEXT_PRIMARY,marginBottom:3},
  bannerSub:{fontSize:12,color:TEXT_SECONDARY,lineHeight:17},
  rescanBtn:{flexDirection:'row',alignItems:'center',gap:6,alignSelf:'flex-start',paddingHorizontal:14,paddingVertical:8,backgroundColor:'#E1F5EE',borderRadius:20,marginBottom:12},
  rescanText:{fontSize:14,color:PRIMARY,fontWeight:'600'},
  card:{backgroundColor:CARD_BG,borderRadius:20,padding:16,marginBottom:14,borderWidth:0.5,borderColor:'#E5E7EB',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.04,shadowRadius:6,elevation:2},
  cardTop:{flexDirection:'row',alignItems:'center',marginBottom:14},
  txIcon:{width:46,height:46,borderRadius:14,alignItems:'center',justifyContent:'center',marginRight:12},
  txMeta:{flex:1},
  txName:{fontSize:16,fontWeight:'700',color:TEXT_PRIMARY,marginBottom:3},
  txTime:{fontSize:13,color:TEXT_SECONDARY},
  checkbox:{width:26,height:26,borderRadius:8,borderWidth:2,borderColor:'#D1D5DB',alignItems:'center',justifyContent:'center',backgroundColor:'#fff'},
  checkOn:{backgroundColor:PRIMARY,borderColor:PRIMARY},
  divider:{height:0.5,backgroundColor:'#F0F0F0',marginBottom:14},
  cardMid:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
  amount:{fontSize:24,fontWeight:'800',letterSpacing:-0.5},
  pill:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:GOLD,paddingHorizontal:12,paddingVertical:7,borderRadius:24},
  pillText:{fontSize:12,fontWeight:'700',color:'#92400E'},
  dropdown:{backgroundColor:CARD_BG,borderRadius:12,borderWidth:1,borderColor:'#E5E7EB',marginBottom:12,overflow:'hidden'},
  dropItem:{paddingHorizontal:16,paddingVertical:11},
  dropActive:{backgroundColor:'#F0FDF4'},
  dropText:{fontSize:14,color:TEXT_PRIMARY},
  dropTextActive:{color:PRIMARY,fontWeight:'600'},
  smsBox:{flexDirection:'row',backgroundColor:'#FAFAFA',borderRadius:10,padding:10,gap:10},
  smsLine:{width:3,borderRadius:2,backgroundColor:GOLD},
  smsText:{flex:1,fontSize:12,color:TEXT_SECONDARY,lineHeight:18},
  footer:{position:'absolute',bottom:0,left:0,right:0,paddingHorizontal:16,paddingBottom:32,paddingTop:12,backgroundColor:BG,borderTopWidth:0.5,borderTopColor:'#E5E7EB'},
  importBtn:{backgroundColor:PRIMARY,borderRadius:16,height:56,alignItems:'center',justifyContent:'center'},
  importOff:{opacity:0.5},
  importText:{fontSize:16,fontWeight:'700',color:'#fff'},
});