console.log('hello')
// Imports
const {
  EC2Client,
  AuthorizeSecurityGroupIngressCommand,
  CreateKeyPairCommand,
  CreateSecurityGroupCommand,
  CreateTagsCommand,
  DescribeSecurityGroupsCommand,
  RunInstancesCommand
} = require('@aws-sdk/client-ec2')

const helpers = require('./helpers')

function sendCommand (command) {
  const client = new EC2Client({region: process.env.AWS_REGION})
 
  return client.send(command)
}


// Declare local variables
const sgName = 'hamster_sg2'
const keyName = 'hamster_key'

async function execute2() {
 console.log("execute2")
}

// Do all the things together
async function execute () {
  console.log('Starting')
  try {
    //await getOrCreateSecurityGroup(sgName)
    //onst keyPair = await createKeyPair(keyName)
    //wait helpers.persistKeyPair(keyPair)
    const data = await createInstance(sgName, keyName)
    console.log('Created instance with:', data)
    console.log('Tagging Instance')
    const instanceId = data.Instances[0].InstanceId;
    await addTagsToInstance(instanceId)
  } catch (err) {
    console.error('Failed to create instance with:', err)
  }
}

// Create functions

async function getOrCreateSecurityGroup(sgName){
  const sgParams = {
    GroupNames: [sgName]
  }

  const describeGroups = new DescribeSecurityGroupsCommand(sgParams)
  try {
    const data = await sendCommand(describeGroups)
  } catch (err){
    if(err.Code == "InvalidGroup.NotFound"){
      return createSecurityGroup(sgName)
    } else {
      throw(err)
    }    
  }


  
}
async function createSecurityGroup (sgName) {
  const sgParams = {
    Description: sgName,
    GroupName: sgName
  }

  const createCommand = new CreateSecurityGroupCommand(sgParams)
  const data = await sendCommand(createCommand)

  const rulesParams = {
    GroupId: data.GroupId,
    IpPermissions: [
      {
        IpProtocol: 'tcp',
        FromPort: 22,
        ToPort: 22,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }]
      },
      {
        IpProtocol: 'tcp',
        FromPort: 3000,
        ToPort: 3000,
        IpRanges: [{CidrIp: '0.0.0.0/0'}]
      }
    ]
  }
  const authCommand = new AuthorizeSecurityGroupIngressCommand(rulesParams)
  return sendCommand(authCommand)
}

async function createKeyPair (keyName) {
 const params = {
  KeyName: keyName
 } 
 const comand = new CreateKeyPairCommand(params)
 return sendCommand(comand)
}

async function createInstance (sgName, keyName) {
  const params  = {
    ImageId: 'ami-0b0dcb5067f052a63',
    InstanceType: 't2.micro',
    KeyName: keyName,
    MaxCount: 1,
    MinCount: 1,
    SecurityGroups: [sgName],
    UserData: 'IyEvYmluL2Jhc2gKY3VybCAtLXNpbGVudCAtLWxvY2F0aW9uIGh0dHBzOi8vcnBtLm5vZGVzb3VyY2UuY29tL3NldHVwXzE2LnggfCBzdWRvIGJhc2ggLQpzdWRvIHl1bSBpbnN0YWxsIC15IG5vZGVqcwpzdWRvIHl1bSBpbnN0YWxsIC15IGdpdApjZCBob21lL2VjMi11c2VyCmdpdCBjbG9uZSBodHRwczovL2dpdGh1Yi5jb20vcnlhbm11cmFrYW1pL2hiZmwuZ2l0CmNkIGhiZmwKbnBtIGkKbnBtIHJ1biBzdGFydA=='
  }
  const command = new RunInstancesCommand(params)
  return sendCommand(command)

}

async function addTagsToInstance(instanceId){
  const tagParams = {
    Resources: [instanceId],
    Tags: [
      {
        Key: "DateCreated",
        Value: new Date().toISOString(),
      },
    ],
  };
    const command = new CreateTagsCommand(tagParams)
    return sendCommand(command) 

}

execute()