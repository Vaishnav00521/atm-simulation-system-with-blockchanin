import fs from 'fs';
import solc from 'solc';
import { ethers } from 'ethers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("🚀 Starting Antigravity Auto-Deploy Protocol...");

    // 1. Read the Solidity Contract
    const contractPath = path.resolve(__dirname, '../src/main/resources/blockchain/GlobalATM.sol');
    const sourceCode = fs.readFileSync(contractPath, 'utf8');

    // 2. Compile the Contract
    console.log("⚙️ Compiling GlobalATM.sol...");
    const input = {
        language: 'Solidity',
        sources: {
            'GlobalATM.sol': {
                content: sourceCode,
            },
        },
        settings: {
            evmVersion: 'paris',
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors && output.errors.some(e => e.severity === 'error')) {
        console.error("Compilation failed!", output.errors);
        return;
    }

    const contract = output.contracts['GlobalATM.sol']['GlobalATM'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    // 3. Connect to Ganache and Deploy
    console.log("🔗 Connecting to Ganache...");
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // The Ganache private key from application.properties
    const privateKey = '0x252bf106342f2df5baf794880117ac9be537196311555e625783bf9817e7771c';
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`👤 Deploying from account: ${wallet.address}`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contractInstance = await factory.deploy();
    
    console.log("⏳ Waiting for block confirmation...");
    await contractInstance.waitForDeployment();
    
    const contractAddress = await contractInstance.getAddress();
    console.log(`✅ Smart Contract deployed securely at: ${contractAddress}`);

    // 4. Auto-update application.properties
    const propsPath = path.resolve(__dirname, '../src/main/resources/application.properties');
    let props = fs.readFileSync(propsPath, 'utf8');
    
    props = props.replace(
        /ethereum\.contract-address=.*/g, 
        `ethereum.contract-address=${contractAddress}`
    );
    
    fs.writeFileSync(propsPath, props);
    console.log("📝 Auto-updated application.properties with the new address!");
    console.log("\n🎉 ALL DONE! Please restart your Spring Boot backend.");
}

main().catch(console.error);
