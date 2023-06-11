import Autobase from 'autobase';


export default function ({localInput = null, localOutput = null, inputs = [], outputs = [], autostart = false, unwrap = false, apply = null} = {}) {


    const autobaseOptns = {
        inputs,              // The list of Hypercores for Autobase to linearize
        outputs,            // An optional list of output Hypercores containing linearied views
        localInput,        // The Hypercore that will be written to in base.append operations
        localOutput,      // A writable Hypercore that linearized views will be persisted into
        apply,                               // Create a linearized view (base.view) immediately using this apply function
        autostart,                          // Create a linearized view (base.view) immediately
        unwrap                             // base.view.get calls will return node values only instead of full nodes
      }
      
   
    return new Autobase(autobaseOptns)
    
}


