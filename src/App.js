import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import {Table, ButtonGroup, Button, Popover, OverlayTrigger} from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';
import {IpfsHost, IpfsPort, ipfs} from './ipfs';
import LandingIntroBanner from './LandingIntroBanner';

const DappAddress = 'n1jabJT7qLZ9133vqYb4fHgY6Tm6MzcCXQM';
// 0917821fec1d7c45006aa68a1676cefa895b896ed278ea36549a7010bbf9fbc6
// 5f563ee81ce19c331bc3dd7cd7bcf39ad9478535106c2eec7d4478b6e60b3743
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: []
    }
  }

  componentDidMount() {
    new window.ClipboardJS('#shareBtn');

    let to = DappAddress;
    let value = "0";
    let callFunction = "forEach";
    let callArgs = "[\"300\",\"0\"]"; //in the form of ["args"]
    var that = this;

    window.nebPay.simulateCall(to, value, callFunction, callArgs, {    //使用nebpay的simulateCall接口去执行get查询, 模拟执行.不发送交易,不上链
        listener: function(response) {
          if(response) {
            if(response.result === "[]") {
              return [];
            } else {
              try {
                let files = JSON.parse(response.result)

                that.setState({
                  files: files
                })  
              } catch (error) {

              }
              
            }  
          }
          
        }
    });
  }
  
  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    this.uploadToIpfs(buffer)
  }

  uploadToIpfs = async (buffer) => {
    await ipfs.add(buffer, (err, ipfsHash) => {      
      console.log(ipfsHash[0].hash)
      console.log(ipfsHash[0].size)
      

      var to = DappAddress;
      var value = "0";
      var callFunction = "save";
      var callArgs = "[\"" + ipfsHash[0].hash + "\"]";
      
      window.nebPay.call(to, value, callFunction, callArgs, {
        listener: function(resp) {
        }
      });

    })
  }

  onDrop(files) {
    let file = files[0]

    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)
  }

  render() {
    const popoverTop = (
      <Popover id="popover-positioned-top" title="">
        <strong>已复制!</strong>
      </Popover>
    );

    return (
      <div className="App">
        <LandingIntroBanner />
        <section>
          <div style={{background: '#E8E9EC', height: '220px', paddingTop: '30px'}}>
            <Dropzone
              multiple={false}
              maxSize={30000000}
              onDrop={this.onDrop.bind(this)}
              style={{width: '80%', height: '160px', borderWidth: '2px',
                borderColor: '#0087F7', borderStyle: 'dashed',
                marginLeft: '10%', background: '#fff'}}>
              <p style={{marginTop: '50px', textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>拖拉文件或者点击上传文件, 一次上传一份文件</p>
              <p style={{marginTop: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: 16}}>单个文件大小最大为30 MB, 不支持mp3, mp4等音频，视频文件</p>
            </Dropzone>
          </div>
          <aside style={{marginLeft: '80px', marginRight: '80px'}}>
            <h2 style={{textAlign: 'center'}}>{`文件列表 (共${this.state.files.length})个`}</h2>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>Ipfs哈希</th>
                  <th>上传者</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.files.map(f => 
                    <tr key={f.ipfsHash}>
                      <td>{f.ipfsHash}</td>
                      <td>{f.createdBy}</td>
                      <td>
                        <ButtonGroup>
                          <Button href={`http://${IpfsHost}:${IpfsPort}/ipfs/${f.ipfsHash}`} target='_blank' id='fileHash'>查看文件</Button>
                          <OverlayTrigger rootClose trigger="click" placement="top" overlay={popoverTop}>
                            <Button id='shareBtn' data-clipboard-text={`http://${IpfsHost}:${IpfsPort}/ipfs/${f.ipfsHash}`}>分享</Button>
                          </OverlayTrigger>
                          
                        </ButtonGroup>
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </Table>
          </aside>
        </section>
      </div>
    );
  }
}

export default App;
