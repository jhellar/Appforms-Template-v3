var sinon = require('sinon');
var proxyquire = require('proxyquire');


describe("Router", function(){
  App = {
    collections: {
      forms: {
        fetch: sinon.spy()
      }
    }
  };
  var LoadingCollectionViewStub = sinon.stub().returns({
    show: sinon.stub()
  });
  LoadingCollectionView = LoadingCollectionViewStub;
  Backbone = require('../../www/lib/backbone.js');
  _ = require('../../www/lib/underscore.js');
  var router = require('../../www/js/router.js');

  beforeEach(function(){
    App.collections.forms.fetch.reset();
    LoadingCollectionViewStub.reset();
  });

  it("Resuming Should Fetch Forms When Enabled", function(done){
    App.resumeFetchAllowed = true;
    router.onResume();

    sinon.assert.calledOnce(LoadingCollectionViewStub);
    sinon.assert.calledOnce(App.collections.forms.fetch);
    done();
  });

  it("Resuming Should Not Fetch Forms When Not Enabled", function(done){
    var LoadingCollectionViewStub = sinon.stub().returns({
      show: sinon.stub()
    });
    LoadingCollectionView = LoadingCollectionViewStub;
    App.resumeFetchAllowed = false;
    router.onResume();

    sinon.assert.notCalled(LoadingCollectionViewStub);
    sinon.assert.notCalled(App.collections.forms.fetch);
    done();
  });

});
