// Synthetic test data only. Never a public estimate or evidence about Kyrgyzstan.
import { UNKNOWN_POPULATION } from '../../src/data/population.js'
export const sources=[{id:'synthetic-only',title:'SYNTHETIC TEST FIXTURE — not scientific evidence',publisher:'Tests only',url:'https://example.org/test-only',accessedAt:'2026-10-29',language:'en',supports:['type','method','value','min','max','territory','year','unit'].map(k=>'population.'+k)}]
export const exact={...UNKNOWN_POPULATION,type:'exact',value:17,year:2020,territory:'Synthetic territory — not Kyrgyzstan',unit:'test individuals',method:'complete-count',sourceIds:['synthetic-only'],reviewStatus:'approved'}
export const fixtures={
 unknown:{...UNKNOWN_POPULATION},exact,
 approximate:{...exact,type:'approximate',value:17,method:'estimate'},
 range:{...exact,type:'approximate',value:null,min:12,max:20,method:'estimate'},
 pending:{...exact,reviewStatus:'pending'},rejected:{...exact,reviewStatus:'rejected'},
 invalid:{...exact,sourceIds:['missing']},
}
