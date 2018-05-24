import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import {Table, ButtonGroup, Button, Popover, OverlayTrigger, Modal, Alert} from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';
import {ipfs} from './ipfs';
import LandingIntroBanner from './LandingIntroBanner';
import { WithContext as ReactTags } from 'react-tag-input';

const DappAddress = 'n1ewBpdc9bjncvBi7Tnx1aZNSx4j5knNsuN'; //6bd973ba89a130abf5bc4af205f16a46f62e1d525a22ac503483671a07185bb0
const KeyCodes = {
  comma: 188,
  enter: 13,
};

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      show: false,
      ipfsHash: '',
      searchTags: [],
      suggestions: [],
      tags: []
    }

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAddSearch = this.handleAddSearch.bind(this);
    this.handleDeleteSearch = this.handleDeleteSearch.bind(this);
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
                let suggestions = []

                files.map(x => suggestions = suggestions.concat(x.tags))
                suggestions = suggestions.filter(onlyUnique)
                suggestions = suggestions.filter(x => x !== '').map(x => ({'id': x, 'text': x}))

                that.setState({
                  files: files,
                  suggestions: suggestions
                })
              } catch (error) {
              }
            }  
          }          
        }
    });
  }

  handleDelete(i) {
    const { tags } = this.state;
    this.setState({
     tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleAddition(tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }
  
  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    this.uploadToIpfs(buffer)
  }

  uploadToIpfs = async (buffer) => {
    window.$('.App').loading({stoppable: true})

    await ipfs.add(buffer, (err, ipfsHash) => {
      window.$('.App').loading('stop')

      if(err) {
        alert('连接IPFS 结点出错')
      } else {
        this.setState({ipfsHash: ipfsHash[0].hash})
        this.handleShow();
      }

    })
  }

  onDropAccepted(files) {
    let file = files[0]

    if(file) {
      let reader = new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => this.convertToBuffer(reader)
    } else {
    }
  }

  onDropRejected(files) {
    alert('文件上传失败，请检查文件大小和文件类型是否被支持')
  }

  handleSubmit() {
    let tags = this.state.tags.map(x => x.text).join(',')

    var to = DappAddress;
    var value = "0";
    var callFunction = "save";
    var callArgs = "[\"" + this.state.ipfsHash + "\",\"" + tags + "\"]";
    
    window.nebPay.call(to, value, callFunction, callArgs, {
      listener: function(resp) {
      }
    });

    this.handleClose();
  }

  handleAddSearch(tag) {
    this.setState(state => ({ searchTags: [...state.searchTags, tag] }));
  }

  handleDeleteSearch(i) {
    const { searchTags } = this.state;
    this.setState({
     searchTags: searchTags.filter((tag, index) => index !== i),
    });
  }


  render() {
    const popoverTop = (
      <Popover id="popover-positioned-top" title="">
        <strong>已复制!</strong>
      </Popover>
    );

    const searchTags = this.state.searchTags.map(x => x.text.toLowerCase())

    return (
      <div className="App">
        <LandingIntroBanner />
        <section>
          <div style={{background: '#EBF0F3', height: '220px', paddingTop: '30px'}}>
            <Dropzone
              multiple={false}
              maxSize={30000000}
              onDropAccepted={this.onDropAccepted.bind(this)}
              onDropRejected={this.onDropRejected.bind(this)}
              rejectStyle={{background: 'red'}}
              style={{width: '80%', height: '160px', borderWidth: '2px',
                borderColor: '#0087F7', borderStyle: 'dashed',
                marginLeft: '10%', background: '#fff'}}>
              <p style={{marginTop: '50px', textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>拖拉文件或者点击上传文件, 一次上传一份文件</p>
              <p style={{marginTop: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: 16}}>单个文件大小最大为30 MB, 暂不支持mp3, mp4等音频，视频文件</p>
            </Dropzone>
          </div>
          <aside style={{marginLeft: '80px', marginRight: '80px'}}>
            <h2 style={{textAlign: 'left'}}>{`文件列表 (共${this.state.files.length}个)`}</h2>

            <div style={{padding: '20px 0px'}}>
              <ReactTags
                placeholder='搜索标签'
                tags={this.state.searchTags}
                suggestions={this.state.suggestions}
                handleDelete={this.handleDeleteSearch}
                handleAddition={this.handleAddSearch}
                delimiters={delimiters}
              />
            </div>

            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>排序</th>
                  <th>IPFS哈希</th>
                  <th>上传者</th>
                  <th>标签</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.files.map((f, index) => {
                    let show = false;
                    let fileTags = f.tags.map(x => x.toLowerCase())

                    if(searchTags.length === 0) {
                      show = true;
                    } else {
                      searchTags.map(st => {
                        if(fileTags.includes(st)) {
                          show = true
                        }
                      })
                    }

                    if(!show) return null;

                    return (
                      <tr key={f.ipfsHash}>
                        <td>{index + 1}</td>
                        <td>{f.ipfsHash}</td>
                        <td>{f.createdBy}</td>
                        <td>
                          {
                            f.tags.map(tag => <span key={`key-${f.ipfsHash}-${tag}`} className='label label-info' style={{marginRight: '2px', backgroundColor: '#0087F7'}}>{tag}</span>)
                          }
                        </td>
                        <td>
                          <ButtonGroup>
                            <Button href={`https://ipfs.io/ipfs/${f.ipfsHash}`} target='_blank' id='fileHash'>查看</Button>
                            <OverlayTrigger rootClose trigger="click" placement="top" overlay={popoverTop}>
                              <Button id='shareBtn' data-clipboard-text={`https://ipfs.io/ipfs/${f.ipfsHash}`}>分享</Button>
                            </OverlayTrigger>
                            
                          </ButtonGroup>
                        </td>
                      </tr>
                    )
                    }
                  )
                }
              </tbody>
            </Table>
          </aside>
        </section>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header>
            <Modal.Title>添加标签</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert bsStyle="info">
              添加标签后，请按<strong>回车键</strong>以完成添加
            </Alert>

            <ReactTags
              tags={this.state.tags}
              suggestions={[]}
              handleDelete={this.handleDelete}
              handleAddition={this.handleAddition}
              delimiters={delimiters}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleSubmit}>不添加</Button>
            <Button bsStyle="primary" onClick={this.handleSubmit}>确定</Button>
          </Modal.Footer>
        </Modal>

      </div>
    );
  }
}

export default App;
