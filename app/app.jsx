var React = require('react');
var ReactDOM = require('react-dom');
var PropTypes = require('prop-types');
var Modal = require('react-bootstrap').Modal;
var Tooltip = require('react-bootstrap').Tooltip;
var Popover = require('react-bootstrap').Popover;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;

var Button = require('react-bootstrap').Button;
var Checkbox = require('react-bootstrap').Checkbox;
var Form = require('react-bootstrap').Form;

var FormGroup = require('react-bootstrap').FormGroup;
var ControlLabel = require('react-bootstrap').ControlLabel;
var FormControl = require('react-bootstrap').FormControl;
var HelpBlock = require('react-bootstrap').HelpBlock;
var Row = require('react-bootstrap').Row;
var Grid = require('react-bootstrap').Grid;
var Col = require('react-bootstrap').Col;

require('style!css!fullcalendar/dist/fullcalendar.min.css');

//Load App css
require('applicaitonStyles');

class Application extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        showRegisterModal: false,
        showEventModal: false,
        events: []
      };
      this.closeRegisterModal = this.closeRegisterModal.bind(this);
      this.openRegisterModal = this.openRegisterModal.bind(this);
      this.closeEventModal = this.closeEventModal.bind(this);
      this.openEventModal = this.openEventModal.bind(this);
      this.saveEvent = this.saveEvent.bind(this);
      this.getEvent = this.getEvent.bind(this);
  }

  closeRegisterModal(){
    this.setState({ showRegisterModal: false });
  }

  openRegisterModal(event){
    this.setState({ event: event  });
    this.setState({ showRegisterModal: true  });
  }

  closeEventModal(){
    this.setState({ showEventModal: false });
  }

  openEventModal(){
    this.setState({ showEventModal: true  });
  }

  saveEvent(event) {
    // store data so the calendar knows to render an event upon drop
    this.state.events[event.id] = event;
  }

  getEvent(id){
    if (this.state.events.length > 0){
        return this.state.events[id];
    }
    return null;
  }

  render() {
    return <div>
      <Menu onOpenRegisterModal={this.openRegisterModal}
        onOpenEventModal={this.openEventModal}
        events = {this.state.events}/>

      <Calendar onOpen={this.openRegisterModal} />

      <Register showModal={this.state.showRegisterModal}
                onClose={this.closeRegisterModal}
                event={this.state.event}/>

      <NewEvent showModal={this.state.showEventModal}
                onClose={this.closeEventModal}
                saveEvent={this.saveEvent}/>

    </div>;
  }
}

/*
 * A simple React componentc
 */
class Calendar extends React.Component {
  constructor(props) {
      super(props);
      this.openModal = this.openModal.bind(this);
  }

  render() {
    return <div id="calendar"></div>;
  }

  openModal(event){
    this.props.onOpen(event);
  }

  componentDidMount() {
    let that = this;
    $('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'listWeek,month,agendaWeek,agendaDay'
			},
      defaultView: 'month',
      selectable: true,
      selectHelper: true,
			editable: true,
			//droppable: true, // this allows things to be dropped onto the calendar

      select: function(start, end) {
				$('#calendar').fullCalendar('unselect');
      },

      eventClick: function(event, jsEvent, view) {
        that.openModal(event);
      }

    })
  }
}

class NewEvent extends React.Component {
  static propTypes = {
    onPlaceSelected: PropTypes.func
  }

  constructor(props) {
      super(props);
      this.state = {
        title: '',
        desc:'',
        file: '',
        imagePreviewUrl: ''

      }
      this.autocomplete = null;
      this.onSelected = this.onSelected.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.toggleEndInput = this.toggleEndInput.bind(this);
      this.handleDescChange = this.handleDescChange.bind(this);
      this.validationDesc = this.validationDesc.bind(this);
      this.handleTitleChange = this.handleTitleChange.bind(this);
      this.validateTitle = this.validateTitle.bind(this);
      this.handleImage = this.handleImage.bind(this);
  }

  componentDidUpdate() {
    if (this.props.showModal) {
      //get input element
      var input = this.inputPlace;

      //create the autocomplete object
      this.autocomplete = new google.maps.places.Autocomplete(input);
      this.autocomplete.addListener('place_changed', this.onSelected());
    }
  }

  handleClose() {
     this.props.onClose()
  }

  onSelected() {
    if (this.props.onPlaceSelected) {
      this.props.onPlaceSelected(this.autocomplete.getPlace());
    }
  }

  toggleEndInput() {
    var disbaled = this.inputEnd.disabled;
    if (disbaled){
      this.inputEnd.disabled = false;
      this.inputTimeEnd.disabled = false;
      this.inputEnd.readOnly = false;
      this.inputTimeEnd.readOnly = false;
    }else{
      this.inputEnd.disabled = true;
      this.inputTimeEnd.disabled = true;
      this.inputEnd.readOnly = true;
      this.inputTimeEnd.readOnly = true;
    }
  }

  handleSubmit(e){
     e.preventDefault();
     var eventData;
     var allDay = false;
     var id = Math.floor((Math.random() * 10000) + 1);
     var image = null;
     if ( this.state.file){
       image =  this.state.file;
     }
     if (this.inputAllDay.checked){
       eventData = {
         id: id,
         title: this.inputTitle.value,
         description: this.inputDescription.value,
         date: this.inputStart.value,
         location: this.inputPlace.value,
         allDay: true,
         image: image
       };

     }else{
       var start = this.inputStart.value+'T'+this.inputTimeStart.value;
       var end = this.inputStart.value+'T'+this.inputTimeEnd.value;
       eventData = {
         id: id,
         title: this.inputTitle.value,
         description: this.inputDescription.value,
         start: start,
         end: end,
         location: this.inputPlace.value,
         allDay: false,
         image: image
       };
     }
     this.props.saveEvent(eventData);
     $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
     this.handleClose();
     this.setState({ title: '' });
     this.setState({ desc: '' });
  }

  validationDesc() {
      const length = this.state.desc.length;
      if (length > 10) return 'success';
      else if (length > 5) return 'warning';
      else if (length > 0) return 'error';
  }

  handleDescChange(e) {
    this.setState({ desc: e.target.value });
  }

  validateTitle() {
      const length = this.state.title.length;
      if (length > 10) return 'success';
      else if (length > 5) return 'warning';
      else if (length > 0) return 'error';
  }

  handleTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  handleImage(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file);
  }

  render() {
     var showModal = this.props.showModal;

     let {imagePreviewUrl} = this.state;
     let $imagePreview = null;
     if (imagePreviewUrl) {
       $imagePreview = (<img src={imagePreviewUrl} />);
     }

     const popover = (
       <Popover id="modal-popover" title="popover">
         very popover. such engagement
       </Popover>
     );
     const tooltip = (
       <Tooltip id="modal-tooltip">
         Add pazzaz by uploading an image.
       </Tooltip>
     );

     return (
       <div>
         <Modal show={showModal} onHide={this.handleClose}>
           <Modal.Header closeButton>
             <Modal.Title>Create New Event</Modal.Title>
           </Modal.Header>
           <Modal.Body>

             <Col sm={10}></Col>
             <Col sm={2}>
               <OverlayTrigger overlay={popover}><a href="#">More</a></OverlayTrigger>
             </Col>

             <br/><br/>
             <Form horizontal>

               <FormGroup controlId="formHorizontalText" validationState={this.validateTitle()} >
                 <Col componentClass={ControlLabel} sm={2}>
                   Title
                 </Col>
                 <Col sm={10}>
                   <FormControl type="text"
                     inputRef={ref => { this.inputTitle = ref; }}
                     ref="title"
                     placeholder="Your Title"
                     value={this.state.title}
                     onChange={this.handleTitleChange}
                     />
                 </Col>
               </FormGroup>
               <FormControl.Feedback />

                 <FormGroup controlId="formHorizontalEmail" validationState={this.validationDesc()} >
                   <Col componentClass={ControlLabel} sm={2}>
                     Description
                   </Col>
                   <Col sm={10}>
                     <FormControl componentClass="textarea"
                       inputRef={ref => { this.inputDescription = ref; }}
                       ref="description"
                       placeholder="Your description here"
                       value={this.state.desc}
                       onChange={this.handleDescChange}/>
                   </Col>
                 </FormGroup>
                 <FormControl.Feedback />
                 <hr/>

                 <FormGroup controlId="formHorizontalEmail">
                   <Col componentClass={ControlLabel} sm={2}>
                     Location
                   </Col>
                   <Col sm={10}>
                     <FormControl type="text"
                       inputRef={ref => { this.inputPlace = ref; }}
                       bsClass="controls placepicker form-control"
                       placeholder="Enter Location"
                       onPlaceSelected />
                   </Col>
                 </FormGroup>
                 <FormControl.Feedback />

                 <br/><br/><br/><br/>

                 <hr/>

                 <FormGroup controlId="formHorizontalEmail">
                  <Col componentClass={ControlLabel} sm={2}>
                    All Day
                  </Col>
                  <Col sm={1}>
                    <Checkbox inputRef={ref => { this.inputAllDay = ref; }}
                              onChange={this.toggleEndInput}/>
                  </Col>
                 </FormGroup>
                 <FormControl.Feedback />

                 <FormGroup controlId="formHorizontalEmail">
                   <Col componentClass={ControlLabel} sm={2}>
                     Start
                   </Col>
                   <Col sm={5}>
                     <FormControl type="date" inputRef={ref => { this.inputStart = ref; }} />
                   </Col>
                   <Col sm={5}>
                     <FormControl type="time" inputRef={ref => { this.inputTimeStart = ref; }} />
                   </Col>
                 </FormGroup>

                 <FormControl.Feedback />

                 <FormGroup controlId="formHorizontalEmail">
                  <Col componentClass={ControlLabel} sm={2}>
                    End
                  </Col>
                  <Col sm={5}>
                    <FormControl type="date" inputRef={ref => { this.inputEnd = ref; }} />
                  </Col>
                  <Col sm={5}>
                    <FormControl type="time" inputRef={ref => { this.inputTimeEnd = ref; }} />
                  </Col>
                 </FormGroup>
                 <FormControl.Feedback />

                 <hr/>

                 <FormGroup controlId="formHorizontalEmail">
                    <HelpBlock>Upload an image of your event.</HelpBlock>
                    <Col componentClass={ControlLabel} sm={3}>
                      Upload Image
                    </Col>
                    <Col sm={6}>
                      <FormControl type="file"
                        inputRef={ref => { this.inputImage = ref; }}
                        onChange={this.handleImage}/>
                    </Col>
                    <Col sm={3}>
                      <OverlayTrigger overlay={tooltip}><a href="#">Tip</a></OverlayTrigger>
                    </Col>
                 </FormGroup>
                 <FormControl.Feedback />
                 <div className="imgPreview">
                   {$imagePreview}
                 </div>
                 <hr/>

                 <FormGroup>
                   <Col smOffset={2} sm={6}>
                     <Button onClick={this.handleSubmit} type="submit">
                       Save Event
                     </Button>
                   </Col>
                 </FormGroup>

             </Form>

           </Modal.Body>
           <Modal.Footer>
             <Button onClick={this.handleClose}>Close</Button>
           </Modal.Footer>
         </Modal>
       </div>
     );
   }
}

class PlacePicker extends React.Component {
  static propTypes = {
    onPlaceSelected: PropTypes.func
  }

  constructor(props) {
      super(props);
      this.autocomplete = null;
      this.onSelected = this.onSelected.bind(this);
  }

  componentDidMount() {
    //get input element
    var input = this.inputLocation;

    //create the autocomplete object
    this.autocomplete = new google.maps.places.Autocomplete(input);
    this.autocomplete.addListener('place_changed', this.onSelected());
  }

  onSelected() {
    if (this.props.onPlaceSelected) {
      this.props.onPlaceSelected(this.autocomplete.getPlace());
    }
  }

  render() {
    return (<div><FormControl type="text"
      inputRef={ref => { this.inputLocation = ref; }}
      bsClass="controls placepicker form-control"
      placeholder="Enter Location"
      onPlaceSelected />
    </div>
    );
  }

}

class Register extends React.Component {

  constructor(props) {
      super(props);
      this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
     this.props.onClose()
   }

   getTimeDiff(start, end){
     var now = moment(start); //todays date
     var end = moment(end); // another date
     var duration = moment.duration(now.diff(end));
     return duration.asHours();
   }

   render() {

     var showModal = this.props.showModal;

     const popover = (
       <Popover id="modal-popover" title="popover">
         very popover. such engagement
       </Popover>
     );
     const tooltip = (
       <Tooltip id="modal-tooltip">
         wow.
       </Tooltip>
     );

     var event = this.props.event;
     var title = "";
     var description = "";
     var location = "";
     var start = "";
     var end = "";
     var allDay = "";
     var starts = "";
     var duration = "";
     let $imagePreview = "";
     if (event){
       title = event.title;
       description = event.description;
       location = event.location;
       allDay = event.allDay;
       start = event.start;
       starts = moment(start).format('LLL');
       if(event.image){
         let reader = new FileReader();
         let file = event.image;
         reader.onloadend = () => {
           this.setState({
             imagePreviewUrl: reader.result
           });
         };
         reader.readAsDataURL(file);

         let {imagePreviewUrl} = this.state;
         if (imagePreviewUrl) {
           $imagePreview = (<img src={imagePreviewUrl} />);
         }
       }

       if (allDay){
         duration = "All Day Event";
       }else{
         end = event.end;
         duration = this.getTimeDiff(end, start)+" Hours";
       }

     }


     return (
       <div>
         <Modal show={showModal} onHide={this.handleClose}>
           <Modal.Header closeButton>
             <Modal.Title>{title}</Modal.Title>
           </Modal.Header>
           <Modal.Body>
             <h4><b>Event Description</b></h4>
             <p>{description}</p>
             <br/>
             <div className="imgPreview">
               {$imagePreview}
             </div>
             <br/>
             <hr/>
             <br/>
             <p><b>Location: </b>{location}</p>
             <p><b>Starts: </b>{starts}</p>
             <p><b>Duration: </b>{duration}</p>
           </Modal.Body>
           <hr/>
          <Modal.Body>

            <Grid>
              <Row className="show-grid">
                <Col sm={6}>
                  <h4>Register</h4>
                </Col>
              </Row>
              <Row className="show-grid">
                <Col smOffset={5} sm={1}>
                  <OverlayTrigger overlay={popover}><a href="#">Pop Icon</a></OverlayTrigger>
                </Col>
              </Row>
            </Grid>

             <Form horizontal>
               <FormGroup controlId="formHorizontalEmail">
                 <Col componentClass={ControlLabel} sm={2}>
                   Name
                 </Col>
                 <Col sm={10}>
                   <FormControl type="name" placeholder="Your Name" disabled defaultValue="Jim Dandy"/>
                 </Col>
               </FormGroup>
               <FormControl.Feedback />

               <HelpBlock>Enter your email address to demo the registration flow.</HelpBlock>

               <FormGroup controlId="formHorizontalEmail">
                 <Col componentClass={ControlLabel} sm={2}>
                   Email
                 </Col>
                 <Col sm={8}>
                   <FormControl type="email" placeholder="Your Email" defaultValue="dandy@dandyworks.com"/>
                 </Col>
                 <Col sm={2}>
                   <OverlayTrigger overlay={tooltip}><a href="#">Tip Icon</a></OverlayTrigger>
                 </Col>
               </FormGroup>

               <FormControl.Feedback />

               <FormGroup controlId="formHorizontalEmail">
                <Col componentClass={ControlLabel} sm={2}>
                  Phone
                </Col>
                <Col sm={10}>
                  <FormControl type="phone" placeholder="Your Phone" disabled defaultValue="303-502-4533"/>
                </Col>
               </FormGroup>
               <FormControl.Feedback />

               <FormGroup controlId="formHorizontalEmail">
                <Col componentClass={ControlLabel} sm={2}>
                  Company
                </Col>
                <Col sm={10}>
                  <FormControl type="company" placeholder="Your Company" disabled defaultValue="Dandy Works" />
                </Col>
               </FormGroup>
               <FormControl.Feedback />
               <br/><br/>
               <FormGroup>
                 <Col smOffset={3} sm={6}>
                   <Button type="submit">
                     Register
                   </Button>
                 </Col>
               </FormGroup>
             </Form>
           </Modal.Body>
           <Modal.Footer>
             <Button onClick={this.handleClose}>Close</Button>
           </Modal.Footer>
         </Modal>
       </div>
     );
   }
}

class Menu extends React.Component {

  constructor(props) {
      super(props);
      this.handleOpenEventModal = this.handleOpenEventModal.bind(this);
  }

  handleOpenEventModal(e){
    e.preventDefault();
    this.props.onOpenEventModal();
  }

  render() {

    var events = this.props.events.map(event => <div key={event.id} onClick={this.props.onOpenRegisterModal.bind(null, event)} className='fc-event'>{event.title}</div>);

    return <div id='external-events'>
      <br/>
      <Button onClick={this.handleOpenEventModal}>Create Event</Button>
      <br/>
			<h4>Upcoming Events</h4>
      {events}

			<p>
				<input type='checkbox' id='drop-remove' />
				<label htmlFor='drop-remove'>Show All</label>
			</p>
		</div>;
  }

}

ReactDOM.render(
    <Application />,
    document.getElementById('app')
);
